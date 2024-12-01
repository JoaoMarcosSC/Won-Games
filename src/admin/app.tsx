// Importa o ícone para o favicon (ícone da aba do navegador).
import { release } from "process";
import Icon from "./extensions/icon.png";

// Importa o logo que será usado na tela de login e no menu lateral.
import Logo from "./extensions/logo.svg";

// Link para a documentação oficial do Strapi sobre customização do painel administrativo.
// https://docs.strapi.io/dev-docs/admin-panel-customization/options

export default {
  config: {
    // Configurações relacionadas à autenticação (tela de login).
    auth: {
      logo: Logo, // Define o logo a ser exibido na tela de login.
    },
    // Configurações para o cabeçalho do painel administrativo.
    head: {
      favicon: Icon, // Define o ícone da aba do navegador.
      title: "Won Games Dashboard", // Define o título que aparecerá na aba do navegador.
    },
    // Define os idiomas suportados no painel administrativo.
    locales: [], // Mantido vazio para usar apenas o idioma padrão (inglês).
    
    // Customizações de texto no painel administrativo.
    translations: {
      en: {
        // Texto de boas-vindas exibido na tela de login.
        "Auth.form.welcome.title": "Welcome to Won Games!", 
        // Subtítulo exibido na tela de login.
        "Auth.form.welcome.subtitle": "Log in to your account",
        // Título exibido no menu lateral do painel.
        "app.components.LeftMenu.navbrand.title": "Won Games Dashboard",
      },
    },
    
    // Configurações do menu lateral do painel administrativo.
    menu: {
      logo: Icon, // Define o ícone a ser exibido no menu lateral.
    },
    
    // Configurações de tema (cores) para o painel administrativo.
    theme: {
      light: {}, // Configurações de tema claro (vazio neste caso).
      dark: { // Configurações de tema escuro.
        colors: {
          primary100: "#030415", // Cor de fundo para elementos destacados.
          primary600: "#f231a5", // Cor primária com intensidade média.
          primary700: "#f231a5", // Cor primária com intensidade maior.
          neutral0: "#0d102f", // Cor de fundo principal do tema escuro.
          neutral100: "#030415", // Cor secundária para elementos neutros.
        },
      },
    },
  },
  tutorials: false,
  notifications: {
    releases: false,
  },

  // Função de bootstrap para executar código ao inicializar o painel administrativo.
  bootstrap() {},
};
