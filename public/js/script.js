  window.localStorage.setItem("Close1",true)
  window.localStorage.setItem("Close2",true)
function test(){

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
    
} 

/////////////////////////////////


function  hideblock(){


  let block = document.querySelector(".block");

  let navBar = document.querySelector(".sidebar");

  
  navBar.style = "right: -250px; transition: 0.5s;";
  let c1 = window.localStorage.setItem("Close1",true)
      block.style = "display:none; opacity: 0%; transition: 0.5s;"

}


////////////////////////////////////

function showConfig(){
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

}

function  hideblock2(){


  let block = document.querySelector(".blur-box");

  let config = document.querySelector(".search-config");

  
  config.style = "display:none; transition: 0.5s;";
 window.localStorage.setItem("Close2",true)
      block.style = "display:none; opacity: 0%; transition: 0.5s;"

}

/*************/


// function activeWrite(){

//   let box = document.getElementById("searchQuery").value
//   let filter = document.querySelector("#specializationId").value


//   if(box.length !== 0 || filter !== "0") {

//   document.querySelector(".buttonE").style = " cursor: pointer !important; opacity:1 !important;"
//   document.getElementById("searchBtn").disabled = false;
// }
//   else{

//     document.querySelector("#searchBtn").disabled = true
//     document.querySelector(".buttonE").style = "opacity:0.5 !important; cursore:no-drop !important;"
  
// }


// }


///////////////////\\
