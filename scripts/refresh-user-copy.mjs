/**
 * Actualiza copy user-facing em pt.json, en.json, fr.json.
 * Tom: directo, natural, mercado angolano — sem jargão técnico.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../src/messages");

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof target[k] === "object") {
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
}

const patches = {
  pt: {
    metadata: {
      title: "Kumbú — Compre e venda em Angola",
      description:
        "Marketplace angolano para comprar, vender e candidatar-se a vagas. Fale com quem vende directamente no chat.",
    },
    header: {
      tagline: "O marketplace feito para Angola",
      searchPrompt: "O que procura?",
    },
    home: {
      searchPlaceholder: "Telemóvel, roupa, casa, vaga…",
      featuredSubtitle: "Anúncios que estão a chamar atenção",
      recentSubtitle: "Publicados recentemente na sua zona",
      noListingsFound: "Nada por aqui. Experimente outras palavras ou publique o que vende.",
    },
    search: {
      placeholder: "Nome do produto, bairro, província…",
      noResults: "Sem resultados. Tente outro termo ou veja as categorias.",
      typeToSearchProduct: "Escreva pelo menos duas letras para procurar.",
    },
    onboarding: {
      heroTitle: "Comprar e vender ficou mais simples",
      heroBody: "Anúncios perto de si, chat directo e conta única na app e no site.",
      slide1Title: "Encontre o que precisa",
      slide1Body: "Produtos, serviços, imóveis e vagas — filtrados por província e município.",
      slide2Title: "Publique em minutos",
      slide2Body: "Fotos, preço e descrição. Quem se interessar manda mensagem na hora.",
      slide3Title: "Negocie com calma",
      slide3Body: "Combine entrega e pagamento no chat. Encontros em sítios públicos e movimentados.",
    },
    account: {
      dangerZoneDescription:
        "A eliminação de conta só é feita pela equipa Kumbú. Use o suporte se precisar fechar a conta.",
      listingsDescription: "Edite, marque como esgotado ou feche vagas. Inactivos deixam de aparecer no feed.",
      identityIntro:
        "Envie fotos nítidas do BI ou passaporte. Os documentos ficam privados — só a equipa de verificação vê.",
      purchasesEmptyDescription:
        "Quando confirmar uma compra, o pedido e o chat com o vendedor aparecem aqui.",
      salesEmptyDescription:
        "Quando alguém comprar os seus anúncios, recebe aviso e abre chat para combinar entrega.",
    },
    chat: {
      noMessages: "Sem mensagens ainda. Diga olá ou pergunte sobre o anúncio.",
      noConversationsDesc:
        "Toque em «Mensagem» num anúncio para falar com o vendedor. Pedidos e candidaturas também abrem chat.",
      multiOrdersBefore:
        "Criámos {count} pedidos — um por vendedor. Abra cada chat para combinar pagamento e entrega, ou veja em",
      startConversation: "Escreva a primeira mensagem",
      dealOpen: "A combinar",
      dealPurchased: "Negócio fechado",
      dealRejected: "Não avançou",
    },
    cart: {
      emptyDescription:
        "Ainda não adicionou nada. Explore anúncios e volte aqui quando quiser comprar.",
      multiSellerNotice:
        "Tem artigos de {count} vendedores diferentes. No checkout serão {count} pedidos separados — cada um com o seu chat.",
      checkout: "Ir para checkout",
    },
    checkout: {
      notice:
        "Ao confirmar, o vendedor é avisado e abre-se o chat. Combine aí o pagamento (Multicaixa, transferência, dinheiro na entrega…) e a forma de receber o produto.",
      confirm: "Confirmar pedido e abrir chat",
      emptyDescription: "O carrinho está vazio. Adicione produtos antes de continuar.",
      multiOrderNotice: "Vai criar {count} pedidos — um chat por vendedor.",
      success: "Pedido registado. Abra o chat para combinar com o vendedor.",
    },
    product: {
      reviewFormIntro: {
        general:
          "Conte como correu a compra. Só pode avaliar depois de marcar «Comprei» no chat ou concluir o pedido.",
        property:
          "Conte como correu a visita ou estadia. Avalie depois de reserva ou acordo no chat.",
        job: "Partilhe a experiência com o empregador — ajuda quem procura emprego.",
      },
      reviewCommentPlaceholder: {
        general: "Como foi o produto e o atendimento do vendedor?",
        property: "Como foi o imóvel e o contacto com o anunciante?",
        job: "Como foi o processo de candidatura e comunicação?",
      },
    },
    publish: {
      intro: "Quatro passos — categoria, detalhes, fotos e revisão. Leva poucos minutos.",
      photoTip:
        "Boas fotos vendem mais. Use luz natural e mostre o produto de frente e de lado.",
      categoriesMissing:
        "Não conseguimos carregar categorias. Verifique a ligação e recarregue a página.",
      noCategories:
        "Categorias indisponíveis de momento. Tente mais tarde ou contacte o suporte.",
      step2Error:
        "O anúncio foi criado mas as fotos falharam. Edite o anúncio em «Os meus anúncios» para voltar a enviar imagens.",
      step3Error:
        "As fotos podem ter sido enviadas mas não ligadas ao anúncio. Verifique em «Os meus anúncios».",
      statusStep1: "A guardar anúncio…",
      statusStep2: "A enviar {count} foto(s)…",
      statusStep3: "A finalizar…",
    },
    store: {
      message: "Enviar mensagem",
      buyOnline: "Adicionar ao carrinho",
      sellerUnavailable: "Este anúncio não tem vendedor associado.",
      openingChat: "A abrir conversa…",
    },
    orders: {
      emptyDescription: "Os seus pedidos aparecem aqui depois de confirmar uma compra.",
      buyerHint:
        "O vendedor actualiza o estado. Use <link>Mensagens</link> para combinar entrega, pagamento e ponto de encontro.",
      c2c: {
        buyer:
          "A Kumbú regista o pedido. Pagamento e entrega combinam-se no chat — prefira locais públicos e movimentados.",
        seller:
          "Venda entre particulares: actualize o estado quando entregar ou concluir. Pagamento é acordado directamente com o comprador.",
      },
    },
    notifications: {
      emptyDescription:
        "Mensagens novas, candidaturas, pedidos e actualizações de conta aparecem aqui.",
    },
    layout: {
      trustVerified: "Vendedores verificados",
      trustChat: "Chat na app",
      trustDelivery: "Em todo o país",
    },
    accountPages: {
      purchases: {
        title: "As minhas compras",
        description: "Pedidos que fez a outros vendedores. Abra o chat de cada um para combinar entrega.",
        emptyDescription: "Quando confirmar uma compra, o pedido aparece aqui com link para o chat.",
      },
      sales: {
        title: "As minhas vendas",
        description: "Quem comprou os seus anúncios. Actualize o estado e fale no chat.",
        emptyDescription: "Quando receber uma compra, avisamos e pode combinar tudo no chat.",
      },
      favorites: {
        emptyDescription: "Guarde anúncios com o coração — ficam aqui para comparar depois.",
      },
    },
    jobs: {
      description: "Vagas em Angola. Monte o CV, candidate-se e fale com o empregador se for aceite.",
      messages: {
        rejectApplication:
          "Olá! Obrigado pela candidatura. Desta vez não avançamos com o seu perfil para esta vaga. Boa sorte na procura.",
        acceptApplication:
          "Boa notícia — a sua candidatura foi aceite! Use este chat para marcar entrevista ou enviar documentos.",
      },
      apply: {
        filled: "Esta vaga já foi preenchida.",
        loginRequired: "Inicie sessão para se candidatar.",
        selectCv: "Escolha um CV para enviar.",
        success: "Candidatura enviada. O empregador será avisado.",
      },
    },
    property: {
      contact: {
        saleHint: "Imóvel à venda — use Mensagem para visitas e propostas.",
        interested: "Quero saber mais",
        useMessageButton: "Toque em Mensagem para falar com o proprietário.",
      },
    },
    legal: {
      report: {
        title: "Denunciar",
        description: "Descreva o problema. A equipa analisa e actua se necessário.",
        submit: "Enviar denúncia",
        success: "Denúncia recebida. Obrigado por ajudar a manter a Kumbú segura.",
      },
    },
    auth: {
      registerIntro: "Crie conta grátis para publicar, comprar e candidatar-se a vagas.",
      loginIntro: "Entre na sua conta Kumbú — a mesma na app e no site.",
    },
    errors: {
      emptyCart: "O carrinho está vazio.",
      createOrderFailed: "Não foi possível registar o pedido. Tente de novo ou fale com o vendedor por mensagem.",
      fetchFailed: "Sem ligação ao servidor. Verifique a internet e tente outra vez.",
      errorPageTitle: "Algo falhou",
    },
  },
  en: {
    metadata: {
      title: "Kumbú — Buy and sell in Angola",
      description:
        "Angolan marketplace to buy, sell, and apply for jobs. Chat directly with sellers.",
    },
    header: {
      tagline: "The marketplace built for Angola",
      searchPrompt: "What are you looking for?",
    },
    home: {
      searchPlaceholder: "Phone, clothes, home, job…",
      featuredSubtitle: "Listings getting attention right now",
      recentSubtitle: "Recently posted near you",
      noListingsFound: "Nothing here yet. Try other words or list what you sell.",
    },
    search: {
      placeholder: "Product name, neighborhood, province…",
      noResults: "No results. Try another term or browse categories.",
      typeToSearchProduct: "Type at least two characters to search.",
    },
    onboarding: {
      heroTitle: "Buying and selling made simple",
      heroBody: "Local listings, direct chat, one account on app and web.",
      slide1Title: "Find what you need",
      slide1Body: "Products, services, property, and jobs — filter by province and municipality.",
      slide2Title: "List in minutes",
      slide2Body: "Photos, price, description. Interested buyers message you right away.",
      slide3Title: "Negotiate safely",
      slide3Body: "Agree delivery and payment in chat. Meet in busy public places.",
    },
    account: {
      dangerZoneDescription:
        "Account deletion is handled by the Kumbú team only. Contact support if you need to close your account.",
      listingsDescription: "Edit, mark out of stock, or close jobs. Inactive listings leave the feed.",
      identityIntro:
        "Send clear photos of your ID or passport. Documents stay private — only the verification team sees them.",
      purchasesEmptyDescription:
        "After you confirm a purchase, the order and seller chat appear here.",
      salesEmptyDescription:
        "When someone buys your listings, you get notified and chat opens to arrange delivery.",
    },
    chat: {
      noMessages: "No messages yet. Say hello or ask about the listing.",
      noConversationsDesc:
        "Tap «Message» on a listing to talk to the seller. Orders and applications also open chat.",
      multiOrdersBefore:
        "We created {count} orders — one per seller. Open each chat to arrange payment and delivery, or see",
      startConversation: "Write the first message",
      dealOpen: "In progress",
      dealPurchased: "Deal done",
      dealRejected: "No deal",
    },
    cart: {
      emptyDescription:
        "Nothing added yet. Browse listings and come back when you're ready to buy.",
      multiSellerNotice:
        "Items from {count} different sellers. Checkout creates {count} separate orders — each with its own chat.",
      checkout: "Go to checkout",
    },
    checkout: {
      notice:
        "When you confirm, the seller is notified and chat opens. Agree payment (bank transfer, cash on delivery…) and how to receive the item there.",
      confirm: "Confirm order and open chat",
      emptyDescription: "Your cart is empty. Add products before continuing.",
      multiOrderNotice: "This will create {count} orders — one chat per seller.",
      success: "Order registered. Open chat to arrange with the seller.",
    },
    product: {
      reviewFormIntro: {
        general:
          "Tell others how the purchase went. You can review after marking «I bought» in chat or completing the order.",
        property:
          "Tell others about the visit or stay. Review after booking or agreement in chat.",
        job: "Share your experience with the employer — it helps other job seekers.",
      },
      reviewCommentPlaceholder: {
        general: "How were the product and the seller?",
        property: "How was the property and contact with the advertiser?",
        job: "How was the application process and communication?",
      },
    },
    publish: {
      intro: "Four steps — category, details, photos, review. Takes just a few minutes.",
      photoTip:
        "Good photos sell faster. Use natural light and show the item from different angles.",
      categoriesMissing:
        "Could not load categories. Check your connection and reload the page.",
      noCategories: "Categories unavailable right now. Try later or contact support.",
      step2Error:
        "Listing was created but photos failed. Edit it under «My listings» to upload images again.",
      step3Error:
        "Photos may have uploaded but were not linked. Check «My listings».",
      statusStep1: "Saving listing…",
      statusStep2: "Uploading {count} photo(s)…",
      statusStep3: "Finishing…",
    },
    store: {
      message: "Send message",
      buyOnline: "Add to cart",
      sellerUnavailable: "This listing has no seller linked.",
      openingChat: "Opening conversation…",
    },
    orders: {
      emptyDescription: "Your orders appear here after you confirm a purchase.",
      buyerHint:
        "The seller updates status. Use <link>Messages</link> to arrange delivery, payment, and meeting point.",
      c2c: {
        buyer:
          "Kumbú registers the order. Payment and delivery are agreed in chat — prefer busy public places.",
        seller:
          "Peer-to-peer sale: update status when you deliver or complete. Payment is agreed directly with the buyer.",
      },
    },
    notifications: {
      emptyDescription:
        "New messages, applications, orders, and account updates appear here.",
    },
    layout: {
      trustVerified: "Verified sellers",
      trustChat: "In-app chat",
      trustDelivery: "Nationwide",
    },
    accountPages: {
      purchases: {
        title: "My purchases",
        description: "Orders from other sellers. Open each chat to arrange delivery.",
        emptyDescription: "After you confirm a purchase, the order appears here with a chat link.",
      },
      sales: {
        title: "My sales",
        description: "Who bought your listings. Update status and chat with buyers.",
        emptyDescription: "When you get a sale, we notify you and you can arrange everything in chat.",
      },
      favorites: {
        emptyDescription: "Save listings with the heart — compare them here later.",
      },
    },
    jobs: {
      description: "Jobs in Angola. Build your CV, apply, and chat with the employer if accepted.",
      messages: {
        rejectApplication:
          "Hello! Thanks for applying. We're not moving forward with your profile for this role. Good luck in your search.",
        acceptApplication:
          "Good news — your application was accepted! Use this chat to schedule an interview or send documents.",
      },
      apply: {
        filled: "This job has been filled.",
        loginRequired: "Sign in to apply.",
        selectCv: "Choose a CV to send.",
        success: "Application sent. The employer will be notified.",
      },
    },
    property: {
      contact: {
        saleHint: "Property for sale — use Message for visits and offers.",
        interested: "I want to know more",
        useMessageButton: "Tap Message to talk to the owner.",
      },
    },
    legal: {
      report: {
        title: "Report",
        description: "Describe the issue. Our team will review and act if needed.",
        submit: "Submit report",
        success: "Report received. Thanks for helping keep Kumbú safe.",
      },
    },
    auth: {
      registerIntro: "Create a free account to list, buy, and apply for jobs.",
      loginIntro: "Sign in to your Kumbú account — same on app and web.",
    },
    errors: {
      emptyCart: "Your cart is empty.",
      createOrderFailed: "Could not register the order. Try again or message the seller.",
      fetchFailed: "No connection to the server. Check your internet and try again.",
      errorPageTitle: "Something went wrong",
    },
  },
  fr: {
    metadata: {
      title: "Kumbú — Acheter et vendre en Angola",
      description:
        "Marketplace angolais pour acheter, vendre et postuler aux offres. Discutez directement avec les vendeurs.",
    },
    header: {
      tagline: "Le marketplace pensé pour l'Angola",
      searchPrompt: "Que cherchez-vous ?",
    },
    home: {
      searchPlaceholder: "Téléphone, vêtements, maison, emploi…",
      featuredSubtitle: "Annonces qui attirent l'attention",
      recentSubtitle: "Publiées récemment près de chez vous",
      noListingsFound: "Rien ici. Essayez d'autres mots ou publiez ce que vous vendez.",
    },
    search: {
      placeholder: "Nom du produit, quartier, province…",
      noResults: "Aucun résultat. Essayez un autre terme ou parcourez les catégories.",
      typeToSearchProduct: "Saisissez au moins deux caractères pour rechercher.",
    },
    onboarding: {
      heroTitle: "Acheter et vendre, enfin simple",
      heroBody: "Annonces locales, chat direct, un seul compte sur l'app et le site.",
      slide1Title: "Trouvez ce qu'il vous faut",
      slide1Body: "Produits, services, immobilier et emploi — filtrez par province et municipalité.",
      slide2Title: "Publiez en quelques minutes",
      slide2Body: "Photos, prix, description. Les acheteurs intéressés vous écrivent tout de suite.",
      slide3Title: "Négociez sereinement",
      slide3Body: "Accordez livraison et paiement dans le chat. Retrouvez-vous dans des lieux publics animés.",
    },
    account: {
      dangerZoneDescription:
        "La suppression de compte est traitée uniquement par l'équipe Kumbú. Contactez l'assistance si besoin.",
      listingsDescription: "Modifiez, marquez épuisé ou fermez les offres. Les inactives quittent le fil.",
      identityIntro:
        "Envoyez des photos nettes de la carte d'identité ou du passeport. Documents privés — seule l'équipe de vérification les voit.",
      purchasesEmptyDescription:
        "Après confirmation d'achat, la commande et le chat vendeur apparaissent ici.",
      salesEmptyDescription:
        "Quand quelqu'un achète vos annonces, vous êtes averti et le chat s'ouvre pour la livraison.",
    },
    chat: {
      noMessages: "Pas encore de messages. Dites bonjour ou posez une question sur l'annonce.",
      noConversationsDesc:
        "Appuyez sur « Message » sur une annonce pour parler au vendeur. Commandes et candidatures ouvrent aussi un chat.",
      multiOrdersBefore:
        "Nous avons créé {count} commandes — une par vendeur. Ouvrez chaque chat pour payer et livrer, ou voir",
      startConversation: "Écrire le premier message",
      dealOpen: "En cours",
      dealPurchased: "Accord conclu",
      dealRejected: "Sans accord",
    },
    cart: {
      emptyDescription:
        "Rien pour l'instant. Parcourez les annonces et revenez quand vous voulez acheter.",
      multiSellerNotice:
        "Articles de {count} vendeurs différents. Le paiement crée {count} commandes séparées — chacune avec son chat.",
      checkout: "Passer au paiement",
    },
    checkout: {
      notice:
        "En confirmant, le vendeur est prévenu et le chat s'ouvre. Accordez-y le paiement (virement, espèces à la livraison…) et la remise du produit.",
      confirm: "Confirmer la commande et ouvrir le chat",
      emptyDescription: "Panier vide. Ajoutez des produits avant de continuer.",
      multiOrderNotice: "Cela créera {count} commandes — un chat par vendeur.",
      success: "Commande enregistrée. Ouvrez le chat pour vous arranger avec le vendeur.",
    },
    product: {
      reviewFormIntro: {
        general:
          "Dites comment s'est passé l'achat. Vous pouvez évaluer après « J'ai acheté » dans le chat ou commande terminée.",
        property:
          "Dites comment s'est passée la visite ou le séjour. Évaluez après réservation ou accord dans le chat.",
        job: "Partagez votre expérience avec l'employeur — cela aide les autres candidats.",
      },
      reviewCommentPlaceholder: {
        general: "Comment étaient le produit et le vendeur ?",
        property: "Comment était le bien et le contact avec l'annonceur ?",
        job: "Comment s'est passée la candidature et la communication ?",
      },
    },
    publish: {
      intro: "Quatre étapes — catégorie, détails, photos, relecture. Quelques minutes suffisent.",
      photoTip:
        "De bonnes photos vendent mieux. Lumière naturelle et plusieurs angles.",
      categoriesMissing:
        "Impossible de charger les catégories. Vérifiez la connexion et rechargez.",
      noCategories: "Catégories indisponibles. Réessayez plus tard ou contactez l'assistance.",
      step2Error:
        "Annonce créée mais photos échouées. Modifiez-la dans « Mes annonces » pour renvoyer les images.",
      step3Error:
        "Les photos ont peut-être été envoyées sans être liées. Vérifiez « Mes annonces ».",
      statusStep1: "Enregistrement de l'annonce…",
      statusStep2: "Envoi de {count} photo(s)…",
      statusStep3: "Finalisation…",
    },
    store: {
      message: "Envoyer un message",
      buyOnline: "Ajouter au panier",
      sellerUnavailable: "Cette annonce n'a pas de vendeur associé.",
      openingChat: "Ouverture de la conversation…",
    },
    orders: {
      emptyDescription: "Vos commandes apparaissent ici après confirmation d'achat.",
      buyerHint:
        "Le vendeur met à jour le statut. Utilisez <link>Messages</link> pour livraison, paiement et lieu de rendez-vous.",
      c2c: {
        buyer:
          "Kumbú enregistre la commande. Paiement et livraison dans le chat — lieux publics fréquentés de préférence.",
        seller:
          "Vente entre particuliers : mettez à jour le statut à la livraison. Paiement directement avec l'acheteur.",
      },
    },
    notifications: {
      emptyDescription:
        "Nouveaux messages, candidatures, commandes et mises à jour de compte ici.",
    },
    layout: {
      trustVerified: "Vendeurs vérifiés",
      trustChat: "Chat intégré",
      trustDelivery: "Dans tout le pays",
    },
    accountPages: {
      purchases: {
        title: "Mes achats",
        description: "Commandes auprès d'autres vendeurs. Ouvrez chaque chat pour la livraison.",
        emptyDescription: "Après confirmation, la commande apparaît ici avec le chat.",
      },
      sales: {
        title: "Mes ventes",
        description: "Qui a acheté vos annonces. Mettez à jour le statut et discutez dans le chat.",
        emptyDescription: "Lors d'une vente, nous vous avertissons et vous arrangez tout dans le chat.",
      },
      favorites: {
        emptyDescription: "Enregistrez avec le cœur — comparez vos annonces ici.",
      },
    },
    jobs: {
      description: "Offres en Angola. Créez votre CV, postulez et discutez si vous êtes retenu.",
      messages: {
        rejectApplication:
          "Bonjour ! Merci pour votre candidature. Nous n'avançons pas avec votre profil pour ce poste. Bonne chance.",
        acceptApplication:
          "Bonne nouvelle — candidature acceptée ! Utilisez ce chat pour l'entretien ou les documents.",
      },
      apply: {
        filled: "Cette offre est pourvue.",
        loginRequired: "Connectez-vous pour postuler.",
        selectCv: "Choisissez un CV à envoyer.",
        success: "Candidature envoyée. L'employeur sera prévenu.",
      },
    },
    property: {
      contact: {
        saleHint: "Bien à vendre — utilisez Message pour visites et offres.",
        interested: "En savoir plus",
        useMessageButton: "Appuyez sur Message pour parler au propriétaire.",
      },
    },
    legal: {
      report: {
        title: "Signaler",
        description: "Décrivez le problème. L'équipe examinera et agira si nécessaire.",
        submit: "Envoyer le signalement",
        success: "Signalement reçu. Merci d'aider à garder Kumbú sûr.",
      },
    },
    auth: {
      registerIntro: "Compte gratuit pour publier, acheter et postuler.",
      loginIntro: "Connectez-vous à Kumbú — même compte sur l'app et le site.",
    },
    errors: {
      emptyCart: "Panier vide.",
      createOrderFailed: "Impossible d'enregistrer la commande. Réessayez ou contactez le vendeur.",
      fetchFailed: "Pas de connexion au serveur. Vérifiez internet et réessayez.",
      errorPageTitle: "Un problème est survenu",
    },
  },
};

for (const locale of ["pt", "en", "fr"]) {
  const path = join(dir, `${locale}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  deepMerge(data, patches[locale]);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Updated ${locale}.json`);
}
