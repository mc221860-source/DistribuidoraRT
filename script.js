
/* ======================================
   DISTRIBUIDORA RT
   Venta de aguacates por kilo y tonelada
====================================== */

/* Configura aquí los precios reales.
   Mientras estén en null, se mostrarán por confirmar. */
const PRECIOS = {
  Kilo: null,
  Tonelada: null
};

// Número de WhatsApp de Distribuidora RT
const WHATSAPP_NEGOCIO = "573205505971";

// Esperar a que cargue todo el HTML
document.addEventListener("DOMContentLoaded", () => {

  // Estado del pedido
  let presentacionSeleccionada = "Kilo";
  let cantidadSeleccionada = 1;
  let carrito = [];

  // Elementos de la página
  const modalPedido = document.getElementById("modalPedido");
  const modalDatos = document.getElementById("modalDatos");
  const carritoLateral = document.getElementById("carritoLateral");
  const fondoCarrito = document.getElementById("fondoCarrito");

  const cantidadPedido = document.getElementById("cantidadPedido");
  const resumenPresentacion = document.getElementById("resumenPresentacion");
  const precioSeleccionado = document.getElementById("precioSeleccionado");
  const totalPedido = document.getElementById("totalPedido");
  const avisoPrecio = document.getElementById("avisoPrecio");

  const itemsCarrito = document.getElementById("itemsCarrito");
  const contadorCarrito = document.getElementById("contadorCarrito");
  const totalCarrito = document.getElementById("totalCarrito");

  const formularioPedido = document.getElementById("formularioPedido");
  const tipoEntrega = document.getElementById("tipoEntrega");
  const direccionCliente = document.getElementById("direccionCliente");
  const grupoDireccion = document.getElementById("grupoDireccion");


  /* ======================================
     FORMATO DE PRECIOS
  ====================================== */

  function formatoPesos(valor) {
    if (
      typeof valor !== "number" ||
      !Number.isFinite(valor) ||
      valor < 0
    ) {
      return "Por confirmar";
    }

    return valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    });
  }

  function obtenerPrecio(presentacion) {
    const precio = PRECIOS[presentacion];

    if (
      typeof precio !== "number" ||
      !Number.isFinite(precio) ||
      precio < 0
    ) {
      return null;
    }

    return precio;
  }

  function textoPresentacion(cantidad, presentacion) {
    const numero = Number(cantidad);
    const nombre = presentacion === "Tonelada"
      ? "tonelada"
      : "kilo";

    return `${numero} ${nombre}${numero === 1 ? "" : "s"}`;
  }

  function precioDeLinea(item) {
    const precio = obtenerPrecio(item.presentacion);

    if (precio === null) {
      return null;
    }

    return precio * item.cantidad;
  }


  /* ======================================
     ABRIR Y CERRAR MODALES
  ====================================== */

  function abrirModal(elemento) {
    if (!elemento) return;

    elemento.classList.add("activo");
    elemento.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function cerrarModal(elemento) {
    if (!elemento) return;

    elemento.classList.remove("activo");
    elemento.setAttribute("aria-hidden", "true");

    if (
      !modalPedido.classList.contains("activo") &&
      !modalDatos.classList.contains("activo") &&
      !carritoLateral.classList.contains("abierto")
    ) {
      document.body.style.overflow = "";
    }
  }

  function abrirFormularioPedido() {
    if (carrito.length === 0) {
      abrirModal(modalPedido);
      return;
    }

    cerrarCarrito();
    abrirModal(modalDatos);
  }

  function abrirCarrito() {
    cerrarModal(modalPedido);
    cerrarModal(modalDatos);

    carritoLateral.classList.add("abierto");
    carritoLateral.setAttribute("aria-hidden", "false");

    fondoCarrito.classList.add("activo");
    document.body.style.overflow = "hidden";
  }

  function cerrarCarrito() {
    carritoLateral.classList.remove("abierto");
    carritoLateral.setAttribute("aria-hidden", "true");

    fondoCarrito.classList.remove("activo");

    if (
      !modalPedido.classList.contains("activo") &&
      !modalDatos.classList.contains("activo")
    ) {
      document.body.style.overflow = "";
    }
  }


  /* ======================================
     BOTONES PRINCIPALES
  ====================================== */

  document.getElementById("abrirPedido")
    ?.addEventListener("click", () => {
      actualizarResumen();
      abrirModal(modalPedido);
    });

  // Opcional: funciona si el botón del producto existe.
  // Si ya lo eliminaste del HTML, no genera errores.
  document.getElementById("abrirPedidoProducto")
    ?.addEventListener("click", () => {
      actualizarResumen();
      abrirModal(modalPedido);
    });

  document.getElementById("cerrarPedido")
    ?.addEventListener("click", () => {
      cerrarModal(modalPedido);
    });

  document.getElementById("cerrarDatos")
    ?.addEventListener("click", () => {
      cerrarModal(modalDatos);
    });

  document.getElementById("abrirCarrito")
    ?.addEventListener("click", abrirCarrito);

  document.getElementById("cerrarCarrito")
    ?.addEventListener("click", cerrarCarrito);

  fondoCarrito.addEventListener("click", cerrarCarrito);

  modalPedido.addEventListener("click", (evento) => {
    if (evento.target === modalPedido) {
      cerrarModal(modalPedido);
    }
  });

  modalDatos.addEventListener("click", (evento) => {
    if (evento.target === modalDatos) {
      cerrarModal(modalDatos);
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      cerrarModal(modalPedido);
      cerrarModal(modalDatos);
      cerrarCarrito();
    }
  });


  /* ======================================
     SELECCIÓN DE PRESENTACIÓN
  ====================================== */

  document.querySelectorAll(".opcion-presentacion")
    .forEach((boton) => {

      boton.addEventListener("click", () => {
        presentacionSeleccionada = boton.dataset.presentacion;

        document.querySelectorAll(".opcion-presentacion")
          .forEach((opcion) => {
            opcion.classList.toggle(
              "seleccionada",
              opcion === boton
            );
          });

        actualizarResumen();
      });

    });


  /* ======================================
     CONTROL DE CANTIDADES
  ====================================== */

  function obtenerCantidadValida() {
    const cantidad = Number.parseInt(cantidadPedido.value, 10);

    if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
      return 1;
    }

    return Math.min(cantidad, 1000000);
  }

  function actualizarResumen() {
    cantidadSeleccionada = obtenerCantidadValida();
    cantidadPedido.value = cantidadSeleccionada;

    resumenPresentacion.textContent = textoPresentacion(
      cantidadSeleccionada,
      presentacionSeleccionada
    );

    const precio = obtenerPrecio(presentacionSeleccionada);

    document.getElementById("precioKiloTexto").textContent =
      obtenerPrecio("Kilo") === null
        ? "Precio por confirmar"
        : formatoPesos(obtenerPrecio("Kilo")) + " / kilo";

    document.getElementById("precioToneladaTexto").textContent =
      obtenerPrecio("Tonelada") === null
        ? "Precio por confirmar"
        : formatoPesos(obtenerPrecio("Tonelada")) + " / tonelada";

    precioSeleccionado.textContent =
      precio === null ? "Por confirmar" : formatoPesos(precio);

    totalPedido.textContent =
      precio === null
        ? "Por confirmar"
        : formatoPesos(precio * cantidadSeleccionada);

    avisoPrecio.textContent =
      precio === null
        ? "El precio se confirmará con Distribuidora RT."
        : "El valor mostrado es estimado y se confirmará al realizar el pedido.";
  }

  document.getElementById("restarCantidad")
    .addEventListener("click", () => {
      cantidadPedido.value = Math.max(
        1,
        obtenerCantidadValida() - 1
      );

      actualizarResumen();
    });

  document.getElementById("sumarCantidad")
    .addEventListener("click", () => {
      cantidadPedido.value = Math.min(
        1000000,
        obtenerCantidadValida() + 1
      );

      actualizarResumen();
    });

  cantidadPedido.addEventListener("input", actualizarResumen);
  cantidadPedido.addEventListener("change", actualizarResumen);


  /* ======================================
     CARRITO DE COMPRAS
  ====================================== */

  function agregarAlCarrito() {
    const cantidad = obtenerCantidadValida();

    const existente = carrito.find((item) => {
      return item.presentacion === presentacionSeleccionada;
    });

    if (existente) {
      existente.cantidad = Math.min(
        1000000,
        existente.cantidad + cantidad
      );
    } else {
      carrito.push({
        presentacion: presentacionSeleccionada,
        cantidad: cantidad
      });
    }

    actualizarCarrito();
    cerrarModal(modalPedido);
    abrirCarrito();
  }

  document.getElementById("agregarCarrito")
    .addEventListener("click", agregarAlCarrito);

  function cambiarCantidadCarrito(indice, cambio) {
    if (!carrito[indice]) return;

    carrito[indice].cantidad = Math.min(
      1000000,
      carrito[indice].cantidad + cambio
    );

    if (carrito[indice].cantidad < 1) {
      carrito.splice(indice, 1);
    }

    actualizarCarrito();
  }

  function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    actualizarCarrito();
  }

  function calcularTotalCarrito() {
    if (carrito.length === 0) {
      return 0;
    }

    let total = 0;

    for (const item of carrito) {
      const subtotal = precioDeLinea(item);

      if (subtotal === null) {
        return null;
      }

      total += subtotal;
    }

    return total;
  }

  function actualizarCarrito() {
    const cantidadTotal = carrito.reduce(
      (suma, item) => suma + item.cantidad,
      0
    );

    contadorCarrito.textContent = cantidadTotal;
    itemsCarrito.replaceChildren();

    if (carrito.length === 0) {
      const vacio = document.createElement("div");
      vacio.className = "carrito-vacio";

      const icono = document.createElement("span");
      icono.textContent = "🛒";

      const texto = document.createElement("p");
      texto.textContent = "Tu carrito está vacío.";

      const detalle = document.createElement("small");
      detalle.textContent = "Agrega aguacates para comenzar.";

      vacio.append(icono, texto, detalle);
      itemsCarrito.appendChild(vacio);

      totalCarrito.textContent = "Por confirmar";
      return;
    }

    carrito.forEach((item, indice) => {
      const contenedor = document.createElement("article");
      contenedor.className = "item-carrito";

      const cabecera = document.createElement("div");
      cabecera.className = "item-carrito-cabecera";

      const informacion = document.createElement("div");

      const titulo = document.createElement("h3");
      titulo.textContent = "Aguacate fresco";

      const detalle = document.createElement("p");
      detalle.textContent = textoPresentacion(
        item.cantidad,
        item.presentacion
      );

      const precio = document.createElement("p");
      const subtotal = precioDeLinea(item);

      precio.textContent = subtotal === null
        ? "Precio por confirmar"
        : formatoPesos(subtotal);

      informacion.append(titulo, detalle, precio);

      const eliminar = document.createElement("button");
      eliminar.type = "button";
      eliminar.className = "eliminar-item";
      eliminar.textContent = "Eliminar";
      eliminar.setAttribute(
        "aria-label",
        "Eliminar " + item.presentacion
      );

      eliminar.addEventListener("click", () => {
        eliminarDelCarrito(indice);
      });

      cabecera.append(informacion, eliminar);

      const controles = document.createElement("div");
      controles.className = "cantidad-carrito";

      const menos = document.createElement("button");
      menos.type = "button";
      menos.textContent = "−";
      menos.setAttribute("aria-label", "Restar cantidad");

      menos.addEventListener("click", () => {
        cambiarCantidadCarrito(indice, -1);
      });

      const cantidad = document.createElement("span");
      cantidad.textContent = item.cantidad;

      const mas = document.createElement("button");
      mas.type = "button";
      mas.textContent = "+";
      mas.setAttribute("aria-label", "Aumentar cantidad");

      mas.addEventListener("click", () => {
        cambiarCantidadCarrito(indice, 1);
      });

      controles.append(menos, cantidad, mas);
      contenedor.append(cabecera, controles);
      itemsCarrito.appendChild(contenedor);
    });

    const total = calcularTotalCarrito();

    totalCarrito.textContent =
      total === null ? "Por confirmar" : formatoPesos(total);
  }


  /* ======================================
     CONTINUAR CON EL PEDIDO
  ====================================== */

  document.getElementById("continuarPedido")
    .addEventListener("click", () => {

      if (carrito.length === 0) {
        alert("Primero agrega aguacates a tu carrito.");
        return;
      }

      abrirFormularioPedido();
    });


  /* ======================================
     DOMICILIO Y DIRECCIÓN
  ====================================== */

  function actualizarCampoDireccion() {
    const requiereDireccion = tipoEntrega.value === "Domicilio";

    direccionCliente.required = requiereDireccion;

    grupoDireccion.style.display = requiereDireccion
      ? "block"
      : "none";

    if (!requiereDireccion) {
      direccionCliente.value = "";
    }
  }

  tipoEntrega.addEventListener("change", actualizarCampoDireccion);
  actualizarCampoDireccion();


  /* ======================================
     ENVIAR PEDIDO POR WHATSAPP
  ====================================== */

  formularioPedido.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      cerrarModal(modalDatos);
      return;
    }

    const nombre = document
      .getElementById("nombreCliente")
      .value.trim();

    const telefono = document
      .getElementById("telefonoCliente")
      .value.trim();

    const entrega = tipoEntrega.value;
    const direccion = direccionCliente.value.trim();

    const pago = document
      .getElementById("metodoPago")
      .value;

    const notas = document
      .getElementById("notasPedido")
      .value.trim();

    if (!nombre || !telefono) {
      alert("Completa tu nombre y número de teléfono.");
      return;
    }

    if (entrega === "Domicilio" && !direccion) {
      alert("Escribe la dirección donde deseas recibir tu pedido.");
      direccionCliente.focus();
      return;
    }

    const lineasPedido = carrito.map((item) => {
      const subtotal = precioDeLinea(item);

      return (
        "- Aguacate fresco: " +
        textoPresentacion(item.cantidad, item.presentacion) +
        " | Subtotal: " +
        (subtotal === null
          ? "Por confirmar"
          : formatoPesos(subtotal))
      );
    });

    const total = calcularTotalCarrito();

    const mensaje = [
      "¡Hola, Distribuidora RT!",
      "",
      "Quiero realizar el siguiente pedido:",
      "",
      ...lineasPedido,
      "",
      "Total estimado: " +
        (total === null ? "Por confirmar" : formatoPesos(total)),
      "",
      "DATOS DEL CLIENTE",
      "Nombre: " + nombre,
      "Teléfono: " + telefono,
      "Entrega: " + entrega,
      ...(entrega === "Domicilio"
        ? ["Dirección: " + direccion]
        : ["Recogeré el pedido en la Central Mayorista"]),
      "Método de pago preferido: " + pago,
      ...(notas ? ["Notas: " + notas] : []),
      "",
      "Por favor, confirmen disponibilidad, precio final y entrega. ¡Gracias!"
    ].join("\n");

    const url =
      "https://wa.me/" +
      WHATSAPP_NEGOCIO +
      "?text=" +
      encodeURIComponent(mensaje);

    window.open(url, "_blank", "noopener,noreferrer");
  });


  /* ======================================
     INICIALIZACIÓN
  ====================================== */

  actualizarResumen();
  actualizarCarrito();

});
