/* 
 * Este arquivo define as rotas customizadas para a API "game" no Strapi.
 * As rotas especificam como as requisições HTTP devem ser mapeadas para os controladores e suas ações correspondentes.
 * Documentação de referência: https://docs.strapi.io/dev-docs/backend-customization/routes
 */

export default {
    routes: [
      {
        // Define o método HTTP para esta rota. Neste caso, POST é usado para criar ou enviar dados ao servidor.
        method: "POST", 
  
        // Define o caminho da URL onde a rota estará disponível.
        // A URL "/games/populate" será usada para acessar esta rota.
        path: "/games/populate", 
  
        // Define o controlador e a ação que será chamado quando esta rota for acessada.
        // Aqui, "game.populate" significa que a ação "populate" do controlador "game" será executada.
        handler: "game.populate",
      },
    ],
  };
  