//========VARIABLES GLOBALES=========//

let USUARIOS={
    admin:"admin123",
    usuario:"1234",
    demo:"demo",
};


let usuarioActual=null;
let peliculasGlobales=[];

//========iINICIALIZACION DE APP=========
document.addEventListener("DOMContentLoaded",()=>{
    inicializarApp();//cargar aplicacion
    eventos();//cargar eventos
})

function inicializarApp(){
    //cargar usuarios registrados en localstorage
    cargarUsuariosRegistrados();

    //verificar si hay un usuario logiado
    let userLogged=localStorage.getItem("usuarioLogueado")
    if(userLogged){
        usuarioActual=JSON.parse(userLogged)
        mostrarDashboard();
    } else {
        mostrarLogin();
    }
    //cargar datos de pelicula de ejemplo la primera vez
    if(!localStorage.getItem("peliculas")){
        cargarDatosEjemplo();
    }
}
function cargarUsuariosRegistrados(){
    //obtener usuarios de localstorage y agregarlo a la variable USUARIOS
    let usuariosRegistrados=JSON.parse(localStorage.getItem("usuariosRegistrados"));
    if(usuariosRegistrados){
        Object.assign(USUARIOS,usuariosRegistrados);
    }
}

function aplicarFiltros(){
    let texto = document.querySelector("#inputBuscar").value.toLowerCase();
    let genero = document.querySelector("#selectGenero").value.toLowerCase();

    let peliculasFiltradas = peliculasGlobales.filter(p => {

        let coincideTexto =
            p.titulo.toLowerCase().includes(texto) ||
            p.director.toLowerCase().includes(texto);

        let coincideGenero =
            genero === "" || p.genero.toLowerCase().includes(genero);

        return coincideTexto && coincideGenero;
    });

    renderizarGrid(peliculasFiltradas);
}

function guardarPelicula(){
    let peliculas = JSON.parse(localStorage.getItem("peliculas")) || [];
    let idEditar = document.querySelector("#idPeliculaEditar").value;

    let nuevaPelicula = {
        id: idEditar ? Number(idEditar) : Date.now(),
        titulo: document.querySelector("#inputTitulo").value.trim(),
        genero: document.querySelector("#inputGenero").value,
        director: document.querySelector("#inputDirector").value.trim(),
        ano: Number(document.querySelector("#inputAno").value),
        calificacion: Number(document.querySelector("#inputCalificacion").value),
        descripcion: document.querySelector("#inputDescripcion").value.trim(),
        imagen: document.querySelector("#inputImagen").value.trim(),
        elenco: document.querySelector("#inputElenco").value.trim()
    };

    // Validaciones
    if(
        !nuevaPelicula.titulo ||
        !nuevaPelicula.genero ||
        !nuevaPelicula.director ||
        !nuevaPelicula.ano ||
        !nuevaPelicula.calificacion ||
        !nuevaPelicula.descripcion ||
        !nuevaPelicula.imagen
    ){
        alert("⚠️ Completa todos los campos obligatorios (marcados con *)");
        return;
    }

    // Validar que el año sea válido
    if(nuevaPelicula.ano < 1900 || nuevaPelicula.ano > new Date().getFullYear() + 5) {
        alert("⚠️ Ingresa un año válido");
        return;
    }

    // Validar calificación
    if(nuevaPelicula.calificacion < 1 || nuevaPelicula.calificacion > 10) {
        alert("⚠️ La calificación debe estar entre 1 y 10");
        return;
    }

    if(idEditar) {
        // Editar película existente
        let indice = peliculas.findIndex(p => p.id === Number(idEditar));
        if(indice !== -1) {
            peliculas[indice] = nuevaPelicula;
            alert("✅ Película actualizada correctamente");
        }
    } else {
        // Agregar nueva película
        peliculas.push(nuevaPelicula);
        alert("✅ Película agregada correctamente");
    }

    localStorage.setItem("peliculas", JSON.stringify(peliculas));

    // refrescar estado global
    peliculasGlobales = peliculas;

    renderizarGrid(peliculasGlobales);
    aplicarFiltros(); // mantiene filtros activos

    document.querySelector("#formPelicula").reset();
    document.querySelector("#idPeliculaEditar").value = "";
    document.querySelector("#previewContainer").style.display = "none";

    // cerrar modal
    bootstrap.Modal
        .getInstance(document.querySelector("#modalAdd"))
        .hide();
}


//=============eventos del usuario=========//
function eventos(){
    document.querySelector("#formLogin").addEventListener("submit", login);
    document.querySelector("#btnSalir").addEventListener("click", logout);
    document.querySelector("#btnEntrar").addEventListener("click", mostrarLogin);
    document.querySelector("#linkLogin").addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector("#login-tab").click();
    });
    document.querySelector("#formRegistro").addEventListener("submit", registrar);

    // 🔍 filtros
    document.querySelector("#inputBuscar").addEventListener("input", aplicarFiltros);
    document.querySelector("#selectGenero").addEventListener("change", aplicarFiltros);

    document.querySelector("#btnGuardarPelicula").addEventListener("click", guardarPelicula);

    // Limpiar formulario cuando se abre modal de agregar película
    document.querySelector("#modalAdd").addEventListener("show.bs.modal", function(e) {
        // Si no viene de editar, limpiar formulario
        if(!document.querySelector("#idPeliculaEditar").value) {
            document.querySelector("#formPelicula").reset();
            document.querySelector("#modalAddLabel").innerHTML = "<i class='bi bi-film'></i> Agregar Película";
        }
        document.querySelector("#previewContainer").style.display = "none";
    });

    // Limpiar campo ID al cerrar modal
    document.querySelector("#modalAdd").addEventListener("hide.bs.modal", function() {
        document.querySelector("#idPeliculaEditar").value = "";
        document.querySelector("#previewContainer").style.display = "none";
    });

    // Vista previa de imagen en tiempo real
    document.querySelector("#inputImagen").addEventListener("change", function() {
        let urlImagen = this.value.trim();
        let previewContainer = document.querySelector("#previewContainer");
        let imagenPreview = document.querySelector("#imagenPreview");
        
        if(urlImagen) {
            imagenPreview.src = urlImagen;
            imagenPreview.onerror = function() {
                previewContainer.style.display = "none";
            };
            imagenPreview.onload = function() {
                previewContainer.style.display = "block";
            };
        } else {
            previewContainer.style.display = "none";
        }
    });
}







function login(e){
    e.preventDefault();//no deja que el botn recarge la pagina porque pone parametros en cero
    let user=document.querySelector("#inputUser").value;//value se optiene el valor de la etiqueta
    let password=document.querySelector("#inputPassword").value;
    if(USUARIOS[user] && USUARIOS[user]===password){
        usuarioActual=user;
        localStorage.setItem("usuarioLogueado",JSON.stringify(user));
        mostrarDashboard();
        document.querySelector("#formLogin").reset(); //reset reinicia el formulario
    }else{
        alert("El usuario y contraseña no son validos")
    }
}

function mostrarDashboard(){
    document.querySelector("#loginSection").style.display="none";
    document.querySelector("#btnEntrar").style.display="none";
    document.querySelector("#btnAgregar").style.display="block";
    document.querySelector("#Dashboard").style.display="block";
    document.querySelector("#btnSalir").style.display="block";
    document.querySelector(".userLogged").textContent=usuarioActual;
    //cargar peliculas
    cargarPeliculas();

}

function mostrarLogin(){
    document.querySelector("#loginSection").style.display="flex";
    document.querySelector("#btnEntrar").style.display="block";
    document.querySelector("#btnAgregar").style.display="none";
    document.querySelector("#Dashboard").style.display="none";
    document.querySelector("#btnSalir").style.display="none";
}

function logout(){
    let confirmar=confirm("¿deseas cerrar sesion?")
    if(confirmar){
        usuarioActual=null;
        localStorage.removeItem("usuarioLogueado")
        mostrarLogin();
        document.querySelector("#formLogin").reset();
    }
}

function registrar(e){
    e.preventDefault();//no se recargue la pagina
    let nombre=document.querySelector("#inputNombre").value.trim();//trim verifica que el nombre sean letras caracteres y no espacios vacios
    let email=document.querySelector("#inputEmail").value.trim();
    let usuario=document.querySelector("#inputUserReg").value.trim();
    let password=document.querySelector("#inputPasswordReg").value.trim();
    let confirmpassword=document.querySelector("#inputConfirmPassword").value.trim();
    //validaciones
    if(nombre && email && usuario && password && confirmpassword){
        //verificar si el usuario existe
        if(USUARIOS[usuario]){
        alert("el usuario ya existe por favor elige otro usuario")
        return
    }
        USUARIOS[usuario]=password;//agregar usuario a la lista
        //guardar en localstorage
        let usuariosRegistrados=JSON.parse(localStorage.getItem("usuariosRegistrados")) || {};
        usuariosRegistrados[usuario]=password;
        localStorage.setItem("usuariosRegistrados",JSON.stringify(usuariosRegistrados));

        //exito
        alert("usuario "+usuario+"registrado con exito, iniacia sesion")

        //limpiar el formulario de registro
        document.querySelector("#formRegistro").reset();
        document.querySelector("#login-tab").click();
        

    }else{
        alert("completa todos los campos");
        return
    }
    if(usuario.length<4){
        alert("el usuario debe tener minimo 4 caracteres")
        return
    }
    if(password.length<6){
        alert("la contrasela debe tener minimo 6 caracteres")
        return
    }
    if(password!==confirmpassword){
        alert("las contraseñas no coiciden")
        return
    }
  
    
}

//peliculas de ejemplo

function cargarDatosEjemplo(){
    let peliculasEjemplo=[
        {
            id:1,
            titulo:"Inception",
            genero:"Ciencia Ficcion",
            director:"Christopher Nolan",
            ano:2010,
            calificacion:8.8,
            descripcion:"Dom Cobb es un ladrón con una extraña habilidad para entrar a los sueños de la gente y robarles los secretos de sus subconscientes.",
            imagen:"https://m.media-amazon.com/images/M/MV5BNTQxYmM1NzQtY2FiZS00MzRhLTljZDYtZjRmMGNiMWI3NTQxXkEyXkFqcGc@._V1_.jpg",
            elenco:"Leonardo DiCaprio, Marion Cotillard, Tom Hardy, Ellen Page"
        },
        {
            id: 2,
            titulo:"Interstellar",
            genero:"Ciencia Ficcion",
            director:"Christopher Nolan",
            ano:2014,
            calificacion:8.6,
            descripcion:"Un grupo de exploradores viaja a través de un agujero de gusano en el espacio para asegurar la supervivencia de la humanidad.",
            imagen: "https://m.media-amazon.com/images/I/91kFYg4fX3L._AC_SL1500_.jpg",
            elenco:"Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine"
        },
        {
            id:3,
            titulo:"The Matrix",
            genero:"Accion / Ciencia Ficcion",
            director:"Lana y Lilly Wachowski",
            ano:1999,
            calificacion:8.7,
            descripcion:"Un programador descubre que la realidad que conoce es una simulación y se une a una rebelión contra las máquinas.",
            imagen:"https://m.media-amazon.com/images/I/51vpnbwFHrL._AC_.jpg",
            elenco:"Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving"
        }
    ];
    //guardar en localstorage
    localStorage.setItem("peliculas",JSON.stringify(peliculasEjemplo));
}

//==========cargar peliculas de ejemplo=====

function cargarPeliculas(){
    let peliculas=localStorage.getItem("peliculas");
    peliculasGlobales=peliculas? JSON.parse(peliculas) : [];
    //mostrar en el grid las peliculas
    renderizarGrid(peliculasGlobales);
}

//=======renderizar peliculas=====//

function renderizarGrid(pelis){
    let grid=document.querySelector("#gridPeliculas");
    let sinResultados=document.querySelector("#sinResultados");

    if(pelis.length==0){
        grid.innerHTML=""
        sinResultados.style.display="block";
        return;
    }
    sinResultados.style.display="none";
    grid.innerHTML=pelis.map(p=>
        `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="movie-card">
                <img src="${p.imagen}" class="movie-image" onerror="this.src='https://www.shutterstock.com/image-vector/simple-image-placeholder-picture-minimalist-260nw-2679706831.jpg'"">
                <div class="movie-content">
                    <h5 class="movie-title">${p.titulo}</h5>
                    <span class="movie-genero">${p.genero}</span>
                    <div><b>${p.ano}</b>-${p.director}</div>
                    <div class="movie-rating">⭐${p.calificacion}/10 </div>
                    <div class="movie-description">${p.descripcion}/10 </div>
                    <div class="movie-actions">
                        <button class="btn btn-info" onclick="verDetalles(${p.id})">ver detalles</button>
                        <button class="btn btn-warning" onclick="editarPelicula(${p.id})">Editar</button>
                        <button class="btn btn-danger" onclick="eliminarPelicula(${p.id})">Eliminar</button>
                    </div>
                    

                </div> 
            </div>
        </div>
        `
        
    ).join("");
}

//===== FUNCIONES PARA VER DETALLES, EDITAR Y ELIMINAR =====

/**
 * Mostrar detalles de una película en modal
 */
function verDetalles(id) {
    let pelicula = peliculasGlobales.find(p => p.id === id);
    
    if(!pelicula) {
        alert("Película no encontrada");
        return;
    }

    // Llenar modal con datos
    document.querySelector("#detallesTitulo").innerHTML = `<i class="bi bi-film"></i> ${pelicula.titulo}`;
    document.querySelector("#detallesGenero").textContent = pelicula.genero;
    document.querySelector("#detallesDirector").textContent = pelicula.director;
    document.querySelector("#detallesAno").textContent = pelicula.ano;
    document.querySelector("#detallesCalificacion").textContent = pelicula.calificacion;
    document.querySelector("#detallesDescripcion").textContent = pelicula.descripcion;
    document.querySelector("#detallesImagen").src = pelicula.imagen;
    document.querySelector("#detallesElenco").textContent = pelicula.elenco || "No disponible";

    // Mostrar modal
    let modal = new bootstrap.Modal(document.querySelector("#modalDetalles"));
    modal.show();
}

/**
 * Abrir modal para editar película existente
 */
function editarPelicula(id) {
    let pelicula = peliculasGlobales.find(p => p.id === id);
    
    if(!pelicula) {
        alert("Película no encontrada");
        return;
    }

    // Cambiar titulo del modal
    document.querySelector("#modalAddLabel").innerHTML = "<i class='bi bi-pencil-square'></i> Editar Película";

    // Llenar formulario con datos de la película
    document.querySelector("#idPeliculaEditar").value = pelicula.id;
    document.querySelector("#inputTitulo").value = pelicula.titulo;
    document.querySelector("#inputGenero").value = pelicula.genero;
    document.querySelector("#inputDirector").value = pelicula.director;
    document.querySelector("#inputAno").value = pelicula.ano;
    document.querySelector("#inputCalificacion").value = pelicula.calificacion;
    document.querySelector("#inputDescripcion").value = pelicula.descripcion;
    document.querySelector("#inputImagen").value = pelicula.imagen;
    document.querySelector("#inputElenco").value = pelicula.elenco || "";

    // Mostrar preview de imagen
    if(pelicula.imagen) {
        document.querySelector("#imagenPreview").src = pelicula.imagen;
        document.querySelector("#previewContainer").style.display = "block";
    }

    // Mostrar modal
    let modal = new bootstrap.Modal(document.querySelector("#modalAdd"));
    modal.show();
}

/**
 * Eliminar película con confirmación
 */
function eliminarPelicula(id) {
    let pelicula = peliculasGlobales.find(p => p.id === id);
    
    if(!pelicula) {
        alert("Película no encontrada");
        return;
    }

    // Confirmación
    if(!confirm(`¿Estás seguro de que deseas eliminar "${pelicula.titulo}"?`)) {
        return;
    }

    // Eliminar de localStorage
    let peliculas = JSON.parse(localStorage.getItem("peliculas")) || [];
    peliculas = peliculas.filter(p => p.id !== id);
    localStorage.setItem("peliculas", JSON.stringify(peliculas));

    // Actualizar estado global
    peliculasGlobales = peliculas;

    // Actualizar vista
    renderizarGrid(peliculasGlobales);
    aplicarFiltros();

    alert("Película eliminada correctamente");
}
