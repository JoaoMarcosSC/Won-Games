/**
 * Serviço personalizado para a entidade "game"
 * Responsável por popular a base de dados com informações obtidas da API GOG
 */

import axios from "axios";
import { JSDOM } from "jsdom"; // Biblioteca para manipulação de DOM em HTML
import slugify from "slugify"; // Biblioteca para gerar slugs únicos
import qs from "querystring"; // Biblioteca para manipulação de query strings
import { factories } from "@strapi/strapi"; // Ferramenta para criar serviços no Strapi

// Serviços Strapi relacionados às entidades associadas
const gameService = "api::game.game";
const publisherService = "api::publisher.publisher";
const developerService = "api::developer.developer";
const categoryService = "api::category.category";
const platformService = "api::platform.platform";

// Função para criar um atraso em ms (usada para evitar sobrecarga nas requisições)
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Função para capturar e estruturar erros
function Exception(e) {
  return { e, data: e.data && e.data.errors && e.data.errors };
}

// Função para buscar informações detalhadas sobre um jogo na página do GOG
async function getGameInfo(slug) {
  try {
    const gogSlug = slug.replaceAll("-", "_").toLowerCase(); // Formata o slug
    const body = await axios.get(`https://www.gog.com/game/${gogSlug}`); // Faz a requisição à página do jogo
    const dom = new JSDOM(body.data); // Converte a resposta HTML para manipulação com JSDOM

    // Obtém a descrição completa e curta do jogo
    const raw_description = dom.window.document.querySelector(".description");
    const description = raw_description.innerHTML;
    const short_description = raw_description.textContent.slice(0, 160);

    // Obtém a classificação indicativa do jogo
    const ratingElement = dom.window.document.querySelector(
      ".age-restrictions__icon use"
    );

    return {
      description,
      short_description,
      rating: ratingElement
        ? ratingElement
            .getAttribute("xlink:href")
            .replace(/_/g, "")
            .replace("#", "")
        : "BR0", // Valor padrão caso não haja classificação
    };
  } catch (error) {
    console.log("getGameInfo:", Exception(error)); // Exibe erros no console
  }
}

// Função para buscar um item pelo nome em um serviço específico
async function getByName(name, entityService) {
  try {
    const item = await strapi.service(entityService).find({
      filters: { name },
    });

    return item.results.length > 0 ? item.results[0] : null; // Retorna o item encontrado ou null
  } catch (error) {
    console.log("getByName:", Exception(error));
  }
}

// Função para criar um item no Strapi se ele ainda não existir
async function create(name, entityService) {
  try {
    const item = await getByName(name, entityService); // Verifica se o item já existe
    if (!item) {
      await strapi.service(entityService).create({
        data: {
          name,
          slug: slugify(name, { strict: true, lower: true }), // Gera um slug único
        },
      });
    }
  } catch (error) {
    console.log("create:", Exception(error));
  }
}

// Função para criar relações muitos-para-muitos (developers, publishers, categorias, plataformas)
async function createManyToManyData(products) {
  const developersSet = new Set(); // Evita duplicatas
  const publishersSet = new Set();
  const categoriesSet = new Set();
  const platformsSet = new Set();

  // Extrai e organiza os dados únicos de cada produto
  products.forEach((product) => {
    const { developers, publishers, genres, operatingSystems } = product;

    genres?.forEach(({ name }) => {
      categoriesSet.add(name);
    });

    operatingSystems?.forEach((item) => {
      platformsSet.add(item);
    });

    developers?.forEach((item) => {
      developersSet.add(item);
    });

    publishers?.forEach((item) => {
      publishersSet.add(item);
    });
  });

  // Cria os itens únicos no banco de dados
  const createCall = (set, entityName) =>
    Array.from(set).map((name) => create(name, entityName));

  return Promise.all([
    ...createCall(developersSet, developerService),
    ...createCall(publishersSet, publisherService),
    ...createCall(categoriesSet, categoryService),
    ...createCall(platformsSet, platformService),
  ]);
}

// Função para enviar uma imagem ao Strapi (capa ou galeria)
async function setImage({ image, game, field = "cover" }) {
  const { data } = await axios.get(image, { responseType: "arraybuffer" }); // Baixa a imagem como buffer
  const buffer = Buffer.from(data, "base64");

  const FormData = require("form-data"); // Biblioteca para envio de dados multipart
  const formData: any = new FormData();

  formData.append("refId", game.id);
  formData.append("ref", `${gameService}`);
  formData.append("field", field);
  formData.append("files", buffer, { filename: `${game.slug}.jpg` });

  console.info(`Uploading ${field} image: ${game.slug}.jpg`);

  try {
    await axios({
      method: "POST",
      url: `http://localhost:1337/api/upload/`, // Endpoint de upload do Strapi
      data: formData,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      },
    });
  } catch (error) {
    console.log("setImage:", Exception(error));
  }
}

// Função para criar jogos e associar seus dados
async function createGames(products) {
  await Promise.all(
    products.map(async (product) => {
      const item = await getByName(product.title, gameService);

      if (!item) {
        console.info(`Creating: ${product.title}...`);

        // Cria o jogo no Strapi
        const game = await strapi.service(`${gameService}`).create({
          data: {
            name: product.title,
            slug: product.slug,
            price: product.price.finalMoney.amount,
            release_date: new Date(product.releaseDate),
            categories: await Promise.all(
              product.genres.map(({ name }) => getByName(name, categoryService))
            ),
            platforms: await Promise.all(
              product.operatingSystems.map((name) =>
                getByName(name, platformService)
              )
            ),
            developers: await Promise.all(
              product.developers.map((name) =>
                getByName(name, developerService)
              )
            ),
            publisher: await Promise.all(
              product.publishers.map((name) =>
                getByName(name, publisherService)
              )
            ),
            ...(await getGameInfo(product.slug)), // Adiciona descrição e classificação
            publishedAt: new Date(),
          },
        });

        // Envia as imagens do jogo (capa e galeria)
        await setImage({ image: product.coverHorizontal, game });
        await Promise.all(
          product.screenshots.slice(0, 5).map((url) =>
            setImage({
              image: `${url.replace(
                "{formatter}",
                "product_card_v2_mobile_slider_639"
              )}`,
              game,
              field: "gallery",
            })
          )
        );

        return game;
      }
    })
  );
}

// Serviço principal para popular a base de dados com os jogos do GOG
export default factories.createCoreService(gameService, () => ({
  async populate(params) {
    try {
      // Monta a URL para buscar os produtos na API GOG
      const gogApiUrl = `https://catalog.gog.com/v1/catalog?${qs.stringify(
        params
      )}`;

      const {
        data: { products },
      } = await axios.get(gogApiUrl);

      // Cria as entidades relacionadas e os jogos
      await createManyToManyData(products);
      await createGames(products);
    } catch (error) {
      console.log("populate:", Exception(error)); // Captura e exibe erros
    }
  },
}));
