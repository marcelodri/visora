export const user = {
    username: "marce dri",
    email: "marcelodri80@gmail.com",
    avatar: "image",
    enabled: true,
    role: 'admin',
    workspace: {
        name: 'Sevel Uruguay'
    },
    origins: [
        {
            id: 1,
            name: 'Db de eze',
            description: 'Es una DB de test',
            type: 'db',
            connector: 'mysql',
            host: 'localhost',
            port: 3306,
            credentials: {
                username: 'root',
                password: '123456'
            },
            permissions: [
                'read', 'edit', 'delete', 'create'
            ]
        }
    ],
    reporters: [
        {
            id: 1,
            name: 'Reporte 1',
            description: 'Es un reporte de test',
            permissions: [
                'read', 'edit', 'delete', 'create'
            ]
        }
    ],
    applications: [
        'reports'
    ]
}