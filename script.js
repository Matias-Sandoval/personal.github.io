const toggleSwitch = document.getElementById('toggle');

// Función para cambiar el tema
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// Agregar evento al toggle
toggleSwitch.addEventListener('change', switchTheme, false);
