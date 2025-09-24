  window.localStorage.setItem("Close1",true)
  window.localStorage.setItem("Close2",true)

function test(){
try{
 let navBar = document.querySelector(".sidebar");
  let block = document.querySelector(".block");

    let c1 = window.localStorage.getItem("Close1")
    if( c1 === "false"){
  
      navBar.style = "right: -250px; transition: 0.5s;";
      let c1 = window.localStorage.setItem("Close1",true)
      block.style = "display:none; opacity: 0%; transition: 0.5s;"

   }else{

    navBar.style = "right: 0px; transition: 0.5s;";
    let c1 = window.localStorage.setItem("Close1",false)
    block.style = "display:block; opacity: 45%; transition: 0.5s;"
}
}catch(e){
  console.log(e)
}
} 

/////////////////////////////////


function  hideblock(){
try{
  let block = document.querySelector(".block");
  let navBar = document.querySelector(".sidebar");

  navBar.style = "right: -250px; transition: 0.5s;";
  let c1 = window.localStorage.setItem("Close1",true)
      block.style = "display:none; opacity: 0%; transition: 0.5s;"

}catch(e){
  console.log(e)
}


}


////////////////////////////////////

function showConfig(){
  try{
  let config = document.querySelector(".search-config");
  let block = document.querySelector(".blur-box");

    let c1 = window.localStorage.getItem("Close2")
    if( c1 === "false"){
  
      config.style = "display:none; transition: 0.5s;";
      window.localStorage.setItem("Close2",true)
      block.style = "display:none; opacity: 0%; transition: 0.5s;"

   }else{

    config.style = "display:block; transition: 0.5s;";
    window.localStorage.setItem("Close2",false)
    block.style = "display:flex; transition: 0.5s;"
}
  }catch(e){
    console.log(e)
  }
}

function  hideblock2(){
  try{
  let block = document.querySelector(".blur-box");
  let config = document.querySelector(".search-config");

  config.style = "display:none; transition: 0.5s;";
  window.localStorage.setItem("Close2",true)
  block.style = "display:none; opacity: 0%; transition: 0.5s;"

  }catch(e){
    console.log(e)
  }
}

/*************/
document.addEventListener('DOMContentLoaded', function() {
try{
let usernames = document.getElementsByClassName("username")
let nameMod = ""
nameMod = usernames[0].innerText.trim().substring(0, 15) + '..';
console.log(nameMod)
 for(let i=0; i<usernames.length; i++){
   if(usernames[i].innerText.length > 15){
     document.getElementsByClassName("username")[i].innerText = nameMod
 }
}
}catch(e){
  console.log("from script.js file"+ e)
}
});