/* Fotos de referência da linha, fornecidas pela Fornada. Não são um feed ao vivo. */
window.FORNADA_PHOTOS = {
  chocolate: "PHOTO-2026-10-28-22-04-51_8.jpg",
  goiabada: "PHOTO-2026-10-28-22-04-51_5.jpg",
  cucas: "PHOTO-2026-10-28-22-04-51_9.jpg",
  salgado: "PHOTO-2026-10-28-22-04-51_4.jpg",
  paes: "PHOTO-2026-10-28-22-04-51_11.jpg",
  brocolis: "PHOTO-2026-10-28-22-04-51.jpg",
  recheado: "PHOTO-2026-10-28-22-04-51_13.jpg"
};
/* Somente para a prévia visual sem API. Não permite registrar pedidos.
   Os IDs reais são sempre recebidos de GET /produtos. */
window.FORNADA_PREVIEW = [
 ["Cuca de Goiabada",25],["Cuca de Goiabada com Requeijão",28],
 ["Cuca de Brigadeiro",25],["Cuca de Doce de Leite",25],
 ["Cuca de Chocolate Branco",28],["Cuca de Chocolate Preto",28],
 ["Cuca de Chocolate Branco e Preto",28],["Cuca de Prestígio",30],
 ["Cuca de Abacaxi",28],["Cuca de Abacaxi com Chocolate Branco",35],
 ["Cuca de Morango com Chocolate Preto",35],["Cuca de Stikadinho",35],
 ["Cuca de Linguiça com Requeijão",35],["Pão Tradicional",15],
 ["Pão com Erva-Doce",16],["Pão Recheado (Calabresa e Queijo)",18],
 ["Pão Recheado (Presunto e Queijo)",18],["Pão Recheado (Frango)",18],
 ["Pão Recheado (Brócolis e Requeijão)",18],["Torta Fria — Pote Individual",15],
 ["Torta Fria — Tamanho Tradicional",70]
].map(function(p,i){return {id: "preview-" + i, nome:p[0], preco:p[1]};});

/* Imagens ilustrativas geradas por IA para os sabores abaixo. */
window.FORNADA_PRODUCT_PHOTOS = {
  "cuca de brigadeiro": "generated/cuca-brigadeiro.jpg",
  "cuca de doce de leite": "generated/cuca-doce-de-leite.jpg",
  "cuca de chocolate branco": "generated/cuca-chocolate-branco.jpg",
  "cuca de chocolate preto": "generated/cuca-chocolate-preto.jpg",
  "cuca de chocolate branco e preto": "generated/cuca-chocolate-misto.jpg",
  "cuca de prestigio": "generated/cuca-prestigio.jpg",
  "cuca de abacaxi": "generated/cuca-abacaxi.jpg",
  "cuca de abacaxi com chocolate branco": "generated/cuca-abacaxi-chocolate-branco.jpg",
  "pao recheado (frango)": "generated/pao-frango.jpg",
  "torta fria - tamanho tradicional": "generated/torta-fria-tradicional.jpg",
  "torta fria - pote individual": "generated/torta-fria-pote.jpg"
};
