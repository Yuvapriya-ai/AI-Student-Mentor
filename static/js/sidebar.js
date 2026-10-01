document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) return;

    const savedScrollPosition =
        sessionStorage.getItem("sidebarScrollTop");

    if (savedScrollPosition !== null) {
        sidebar.scrollTop = parseInt(savedScrollPosition, 10);
    }

    sidebar.addEventListener("scroll", () => {

        sessionStorage.setItem(
            "sidebarScrollTop",
            sidebar.scrollTop
        );

    });

});