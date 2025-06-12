(function(){
  document.addEventListener("DOMContentLoaded", ()=>{
    // grab the <nav> you included…
    const navLeft  = document.querySelector(".menu-left");
    const navRight = document.querySelector(".menu-right");

    // discover your “user type” – you just need to set this once on <body>
    // e.g. <body data-user-type="bluehq">…
    const userType = document.body.dataset.userType;
    const cfg = (window.MENU_CONFIG||{})[userType] || { left:[], right:[] };

    const makeLi = ({title,href})=>{
      const li = document.createElement("li");
      const a  = document.createElement("a");
      a.textContent = title;
      a.href        = href;
      li.append(a);
      return li;
    };

    cfg.left.forEach(item  => navLeft .append(makeLi(item)));
    cfg.right.forEach(item => navRight.append(makeLi(item)));
  });
})();