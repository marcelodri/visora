const menu = [
    {
        name: 'home',
        link: "/panel", // Incluyendo la ruta padre
        icon: '<i class="bi bi-house"></i>'
    },
    {
        name: 'settings',
        icon: '<i class="bi bi-gear"></i>',
        children: [
            { name: 'brands', link: '/panel/settings/brands' },
            { name: 'business-types', link: '/panel/settings/business-types' }
        ]
    },
    {
        name: 'forms',
        link: "/panel/forms", // Incluyendo la ruta padre
        icon: '<i class="bi bi-list-ul"></i>'
    },
    {
        name: 'products',
        link: "/panel/products", // Incluyendo la ruta padre
        icon: '<i class="bi bi-bag"></i>'
    },
    {
        name: 'aboutus',
        link: "/panel/aboutus", // Incluyendo la ruta padre
        icon: '<i class="bi bi-file-earmark-person"></i>'
    },
    {
        name: 'header_footer',
        link: "/panel/header_footer", // Incluyendo la ruta padre
        icon: '<i class="bi bi-filetype-html"></i>'
    },
    {
        name: 'templates',
        link: "/panel/templates", // Incluyendo la ruta padre
        icon: '<i class="bi bi-columns"></i>'
    }
    // ,
    // {
    //     name: 'search',
    //     link: "/panel/advancedSearch", // Incluyendo la ruta padre
    //     icon: '<i class="bi bi-binoculars"></i>'
    // },
    // {
    //     name: 'reports',
    //     link: "/panel/reports", // Incluyendo la ruta padre
    //     icon: '<i class="bi bi-list-task"></i>'
    // },
    // {
    //     name: 'search_engine_with_ai',
    //     link: "/panel/search_ai", // Incluyendo la ruta padre
    //     icon: '<i class="bi bi-binoculars"></i>'
    // },
    // {
    //     name: 'doc_search_ai',
    //     link: "/panel/doc_search_ai", // Incluyendo la ruta padre
    //     icon: '<i class="bi bi-filetype-pdf"></i>'
    // }
    
];

export default menu;
