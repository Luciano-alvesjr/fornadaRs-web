"use strict";
(function () {
  const $ = function(s) { return document.querySelector(s); };
  const money = function(v) { return Number(v).toLocaleString("pt-BR", {style:"currency",currency:"BRL"}); };
  const normalize = function(s) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); };
  const esc = function(s) { return String(s).replace(/[&<>"']/g, function(c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  const storage = {get:function(key) {try{return JSON.parse(localStorage.getItem(key));}catch{return null;}},
    set:function(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Sacola continua em memória. */}}};
  let products = [], cart = [], filter = "todos", online = false, busy = false, ready = false;
  let lastOrder = storage.get("fornada.order.v1"), toastTimer;
  const dialog = $("#cart-dialog");
  const category = function(p) { const n = normalize(p.nome); return n.startsWith("pao") ? "paes" : n.startsWith("torta") ? "tortas" : "cucas"; };
  const categoryLabel = {cucas:"CUCAS",paes:"PÃES",tortas:"TORTA FRIA"};
  function photo(p) {
    const n = normalize(p.nome), f = window.FORNADA_PHOTOS;
    const key = n.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
    if(window.FORNADA_PRODUCT_PHOTOS[key]) return window.FORNADA_PRODUCT_PHOTOS[key];
    if(category(p)==="tortas") return null;
    if(category(p)==="paes") return n.includes("brocolis") ? f.brocolis : n.includes("recheado") ? f.recheado : f.paes;
    if(n.includes("linguica")) return f.salgado;
    if(n.includes("goiabada")) return f.goiabada;
    if(n.includes("chocolate") || n.includes("brigadeiro") || n.includes("stikadinho")) return f.chocolate;
    return f.cucas;
  }
  function description(p) {
    const n=normalize(p.nome);
    if(category(p)==="tortas") return n.includes("individual") ? "Uma porção para o seu momento." : "Para dividir em volta da mesa.";
    if(category(p)==="paes") return n.includes("recheado") ? "Massa macia, recheio generoso." : "O sabor simples do pão à mesa.";
    return n.includes("linguica") ? "Uma combinação salgada para compartilhar." : "Massa macia e farofinha crocante.";
  }
  function toast(message) { $("#toast").textContent=message; $("#toast").classList.add("visible"); clearTimeout(toastTimer); toastTimer=setTimeout(function(){$("#toast").classList.remove("visible");},3000); }
  function renderProducts() {
    if(!products.length){$("#product-grid").innerHTML="";return;}
    const query=normalize($("#search").value.trim());
    const visible=products.filter(function(p){return (filter==="todos" || category(p)===filter) && normalize(p.nome).includes(query);});
    $("#product-grid").innerHTML=visible.length ? visible.map(function(p){
      const image=photo(p), illustrative=Boolean(image && image.startsWith("generated/")), shortName=p.nome.replace(/^Cuca de /,"");
      return '<article class="product-card"><div class="product-image">' +
        (image?'<img loading="lazy" width="450" height="500" src="assets/'+esc(image)+'" alt="'+(illustrative?'Imagem ilustrativa de '+esc(p.nome):'Foto de referência da linha '+esc(categoryLabel[category(p)].toLowerCase())+' da Fornada')+'">':'<div class="torta-art"><span aria-hidden="true">❧</span><small>PARA BONS ENCONTROS</small><strong>Torta<br>fria.</strong><small>SOB ENCOMENDA</small></div>')+
        (illustrative?'<span class="illustrative-label">Imagem ilustrativa</span>':'')+'<span class="product-category">'+categoryLabel[category(p)]+'</span></div><div class="product-info"><h3>'+esc(shortName)+'</h3><p>'+esc(description(p))+'</p><div class="product-bottom"><span class="product-price">'+money(p.preco)+'</span><button class="add-button" data-add="'+esc(p.id)+'" aria-label="Adicionar '+esc(p.nome)+' à sacola">+</button></div></div></article>';
    }).join("") : '<p class="empty-results">Nenhum sabor encontrado. Tente outro nome ou categoria.</p>';
  }
  function cartData() {
    return cart.map(function(item){const p=products.find(function(p){return String(p.id)===String(item.id);});return p?{product:p,quantity:item.quantity}:null;}).filter(Boolean);
  }
  function persistCart(){if(online)storage.set("fornada.cart.v1",cart);}
  function count(){return cartData().reduce(function(n,item){return n+item.quantity;},0);}
  function total(){return cartData().reduce(function(n,item){return n+Math.round(item.product.preco*100)*item.quantity;},0)/100;}
  function renderCart() {
    const data=cartData(), quantity=count();
    $("#cart-count").textContent=quantity; $("#mobile-count").textContent=quantity;
    $("#mobile-total").textContent=money(total()); $("#mobile-cart").hidden=!quantity;
    $("#cart-total").textContent=money(ready && lastOrder ? lastOrder.order.total : total());
    $("#checkout-fields").hidden=!data.length || ready;
    $("#prepare-order").hidden=ready;
    $("#prepare-order").disabled=!data.length || !online || busy;
    $("#prepare-order").textContent=busy ? "Preparando seu pedido…" : "Preparar pedido para o Direct ↗";
    $("#cart-items").hidden=ready;
    $("#order-ready").hidden=!ready;
    $("#cart-items").innerHTML=data.length?data.map(function(item){
      const p=item.product,image=photo(p);
      return '<article class="cart-item">'+(image?'<img src="assets/'+esc(image)+'" alt="">':'<span class="cart-placeholder" aria-hidden="true">F</span>')+
        '<div class="cart-item-info"><h3>'+esc(p.nome)+'</h3><p>'+money(p.preco)+' / unidade</p><div class="quantity"><button data-change="-1" data-id="'+esc(p.id)+'" aria-label="Diminuir quantidade de '+esc(p.nome)+'">−</button><output aria-label="Quantidade">'+item.quantity+'</output><button data-change="1" data-id="'+esc(p.id)+'" aria-label="Aumentar quantidade de '+esc(p.nome)+'">+</button></div><button class="remove-item" data-remove="'+esc(p.id)+'">Remover</button></div><strong style="font-size:12px;white-space:nowrap">'+money(Math.round(p.preco*100)*item.quantity/100)+'</strong></article>';
    }).join(""):'<div class="cart-empty"><span aria-hidden="true">❧</span><h3>Uma sacola cheia de possibilidades.</h3><p>Escolha seus sabores favoritos no cardápio.</p><button class="button outline" data-close>Explorar sabores</button></div>';
  }
  function add(id) {
    if(busy) return;
    if(ready){ready=false;}
    const item=cart.find(function(item){return String(item.id)===String(id);});
    if(item){if(item.quantity>=100){toast("Para quantidades maiores, fale com a Fornada no Direct.");return;}item.quantity++;}
    else cart.push({id:id,quantity:1});
    persistCart();renderCart();toast("Adicionado à sua sacola.");
  }
  function openCart(){renderCart();if(!dialog.open)dialog.showModal();}
  function closeCart(){if(!busy)dialog.close();}
  function showError(message){$("#cart-error").textContent=message;$("#cart-error").hidden=false;}
  async function request(path,options) {
    const response=await fetch(path,Object.assign({signal:AbortSignal.timeout(15000)},options));
    if(!response.ok){let info;try{info=await response.json();}catch{}
      const err=new Error(info && info.detail || "Não foi possível concluir agora. Tente novamente.");
      err.status=response.status;throw err;
    }
    return response.json();
  }
  async function loadCatalog(){
    $("#retry-catalog").hidden=true;$("#catalog-status").textContent="Buscando o cardápio…";
    try{
      const result=await request("/produtos");
      if(!Array.isArray(result))throw new Error("Resposta inesperada do cardápio.");
      products=result.filter(function(p){return Number.isSafeInteger(p.id) && typeof p.nome==="string" && Number.isFinite(Number(p.preco)) && Number(p.preco)>0;});
      if(products.length!==result.length)throw new Error("Há produtos com dados inválidos no cardápio.");
      online=true;$("#catalog-status").classList.remove("preview");
      $("#catalog-status").textContent=products.length?"":"O cardápio está sendo preparado. Fale com a gente no Instagram.";
    }catch(error){
      online=false;
      if(new URLSearchParams(location.search).get("preview")==="1"){
        products=window.FORNADA_PREVIEW;$("#catalog-status").classList.add("preview");
        $("#catalog-status").textContent="Prévia visual com o cardápio de referência. Cadastros e envio de pedidos estão desativados até conectar a API.";
      }else{
        products=[];$("#catalog-status").textContent="Não conseguimos carregar o cardápio agora. Tente novamente ou fale com @fornada.rs.";
        $("#retry-catalog").hidden=false;
      }
    }
    $("#all-count").textContent=products.length;
    const saved=storage.get("fornada.cart.v1");
    cart=Array.isArray(saved)?saved.filter(function(item){return item && Number.isInteger(item.quantity) && item.quantity>0 && item.quantity<=100 && products.some(function(p){return String(p.id)===String(item.id);});}):[];
    persistCart();renderProducts();renderCart();
  }
  function signature(){return JSON.stringify(cartData().map(function(item){return {produtoId:item.product.id,quantidade:item.quantity};}).sort(function(a,b){return a.produtoId-b.produtoId;}));}
  function message(order) {
    const name=$("#customer-name").value.trim(), payment=$('input[name="payment"]:checked').value, notes=$("#order-notes").value.trim();
    return "Olá, Fornada! " + (name?"Meu nome é "+name+". ":"") + "Gostaria de combinar esta encomenda.\n\n"+
      "Pedido #"+order.id+"\n"+order.itens.map(function(item){return item.quantidade+" × "+item.nomeProduto+" — "+money(item.subtotal);}).join("\n")+
      "\n\nTotal dos produtos: "+money(order.total)+"\nPreferência de pagamento: "+payment+
      (notes?"\nObservações: "+notes:"")+"\n\nPodem confirmar a disponibilidade, o pagamento e os detalhes de entrega ou retirada?";
  }
  async function prepareOrder(){
    if(busy || !online || !cartData().length)return;
    busy=true;$("#cart-error").hidden=true;renderCart();
    const key=signature();
    try{
      let order;
      if(lastOrder && lastOrder.signature===key && Date.now()-lastOrder.created<3600000){order=lastOrder.order;}
      else{
        const items=cartData().map(function(item){return {produtoId:item.product.id,quantidade:item.quantity};});
        order=await request("/pedidos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({itens:items})});
        if(!order || !Number.isSafeInteger(order.id) || !Array.isArray(order.itens))throw new Error("Não foi possível interpretar o pedido. Confira com a Fornada antes de tentar novamente.");
        lastOrder={signature:key,order:order,created:Date.now()};storage.set("fornada.order.v1",lastOrder);
      }
      $("#order-message").value=message(order);ready=true;
      $("#cart-title").textContent="Sua encomenda";
      $(".cart-scroll").scrollTop=0;
    }catch(error){
      showError(error.status===404?"Um produto não está mais disponível. Atualize o cardápio antes de continuar.":error.message==="Failed to fetch"?"Não foi possível confirmar o registro. Sua sacola foi mantida. Confira com a Fornada antes de reenviar para evitar duplicidade.":error.message);
    }finally{busy=false;renderCart();}
  }
  $("#product-grid").addEventListener("click",function(event){const button=event.target.closest("[data-add]");if(button)add(button.dataset.add);});
  $(".tabs").addEventListener("click",function(event){const button=event.target.closest("[data-filter]");if(!button)return;filter=button.dataset.filter;document.querySelectorAll("[data-filter]").forEach(function(b){b.classList.toggle("active",b===button);b.setAttribute("aria-pressed",b===button);});renderProducts();});
  $("#search").addEventListener("input",renderProducts);
  $("#open-cart").addEventListener("click",openCart);
  $("#mobile-cart").addEventListener("click",openCart);
  $("#close-cart").addEventListener("click",closeCart);
  dialog.addEventListener("cancel",function(e){if(busy)e.preventDefault();});
  dialog.addEventListener("click",function(event){if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right)closeCart();}});
  $("#cart-items").addEventListener("click",function(event){
    if(busy)return;
    if(event.target.closest("[data-close]")){closeCart();return;}
    const remove=event.target.closest("[data-remove]"),change=event.target.closest("[data-change]");
    if(remove)cart=cart.filter(function(item){return String(item.id)!==remove.dataset.remove;});
    if(change){const item=cart.find(function(item){return String(item.id)===change.dataset.id;});if(item){item.quantity=Math.min(100,item.quantity+Number(change.dataset.change));cart=cart.filter(function(i){return i.quantity>0;});}}
    persistCart();renderCart();
  });
  $("#prepare-order").addEventListener("click",prepareOrder);
  $("#copy-order").addEventListener("click",async function(){
    const text=$("#order-message").value;
    try{await navigator.clipboard.writeText(text);$("#copy-order").textContent="Resumo copiado ✓";toast("Agora abra o Direct e cole o resumo na conversa.");}
    catch{$("#order-message").focus();$("#order-message").select();toast("Selecione o resumo e copie para colar no Direct.");}
  });
  $("#direct-link").addEventListener("click",function(){toast("No Instagram, cole o resumo e envie para confirmar.");});
  $("#new-order").addEventListener("click",function(){cart=[];ready=false;lastOrder=null;storage.set("fornada.order.v1",null);persistCart();$("#cart-title").textContent="Sua sacola";$("#cart-error").hidden=true;$("#order-message").value="";$("#order-notes").value="";$("#copy-order").textContent="Copiar resumo";renderCart();});
  $("#retry-catalog").addEventListener("click",loadCatalog);
  document.querySelectorAll("[data-stage]").forEach(function(button){button.addEventListener("click",function(){
    const preparation=button.dataset.stage==="preparo";
    $("#hero-image").src="assets/PHOTO-2026-10-28-22-04-51_"+(preparation?"1":"8")+".jpg";
    $("#hero-image").alt=preparation?"Cuca em preparo com chocolate e morangos, antes de ir ao forno":"Cuca pronta com farofa dourada e recheio de chocolate";
    document.querySelectorAll("[data-stage]").forEach(function(b){b.classList.toggle("active",b===button);b.setAttribute("aria-pressed",b===button);});
  });});
  if(matchMedia("(hover:hover) and (prefers-reduced-motion:no-preference)").matches){
    let frame;
    $("#hero-art").addEventListener("pointermove",function(event){cancelAnimationFrame(frame);frame=requestAnimationFrame(function(){const r=$("#hero-art").getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;$("#hero-photo").style.transform="rotate(-6deg) rotateY("+(x*10)+"deg) rotateX("+(-y*9)+"deg)";});});
    $("#hero-art").addEventListener("pointerleave",function(){cancelAnimationFrame(frame);$("#hero-photo").style.transform="rotate(-6deg)";});
  }
  $("#year").textContent=new Date().getFullYear();
  loadCatalog();
})();
