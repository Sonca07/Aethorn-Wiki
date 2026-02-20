# CLAUDE.md — Proyecto Aethorn Webapp

## Estructura del proyecto
```
C:\Users\sonca\OneDrive\Escritorio\Sonca\D&D\
├── Aethorn\          ← Contenido MD del vault de Obsidian
│   ├── Arte\
│   │   ├── Blasones\
│   │   ├── Mapas\
│   │   └── Retratos\
│   ├── Facciones\
│   │   ├── Alianza de las Forjas Vornidas\
│   │   └── Confluencia de Vael\
│   ├── Historia de Aethorn\
│   │   ├── Calendario\
│   │   └── Las Eras de Aethorn\
│   └── Razas\
│       ├── Confluencia de Vael\
│       ├── Forjas Vornidas\
│       └── Neutrales\
└── Webapp\           ← Proyecto Next.js generado en v0
```

## Descripción del proyecto

Sitio web para el setting de D&D 5e llamado **Aethorn**, un mundo de fantasía épica steampunk similar a Arcanum: Of Steamworks and Magick Obscura. El sitio es una wiki de worldbuilding con dos facciones principales:

- **La Alianza de las Forjas Vornidas** — facción tecnológica/steampunk
- **La Confluencia del Vael** — facción mágica/arcana

## Stack tecnológico

- Next.js (App Router)
- Tailwind CSS
- Markdown rendering con gray-matter y remark
- Deployado en GitHub Pages o Vercel

## Tareas principales

1. Conectar la carpeta `Aethorn\` como fuente de contenido MD
2. Generar rutas dinámicas para cada archivo MD
3. Renderizar el contenido con el estilo visual de la Webapp
4. Implementar búsqueda entre todos los MD
5. Mostrar páginas relacionadas basadas en los links `[[]]` de Obsidian
6. Mostrar imágenes de Arte correctamente referenciadas

## Convenciones de los MD

- Los links internos usan sintaxis Obsidian: `[[Nombre de nota]]`
- Las imágenes están en `Aethorn\Arte\`
- El contenido está en español
- Algunas notas tienen frontmatter YAML con: title, faction, type, tags, related

## Paleta de colores

- Fondo: #1a1a1a
- Títulos: #c9a84c (dorado envejecido)
- Acento: #6b1f1f (borgoña)
- Texto: #f0e6c8 (pergamino)