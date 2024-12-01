/**
 * game controller
 * 
 * Este arquivo define um controlador personalizado para a API "game" no Strapi.
 * Ele utiliza o sistema de fábricas do Strapi para criar controladores baseados 
 * na estrutura principal fornecida pelo framework.
 */

import { factories } from '@strapi/strapi' // Importa o módulo de fábricas do Strapi para criação de controladores.

// Exporta o controlador criado utilizando a função `createCoreController` do Strapi.
export default factories.createCoreController(
  "api::game.game", // Especifica o namespace do modelo que este controlador irá gerenciar (no caso, o modelo "game" na API "game").
  ({ strapi }) => ({ // Função para estender ou customizar as funções padrão do controlador.
    // Define uma ação customizada chamada "populate".
    async populate(ctx) {
      // Exibe uma mensagem no console do servidor quando esta ação é executada.
      console.log("RODANDO NO SERVIDOR");

      // Envia uma resposta para o cliente indicando que a ação foi concluída.
      ctx.send("FINALIZADO NO CLIENT");
    },
  })
);
