module.exports = {
  siteMetadata: {
    title: "Gatsby&Kontent Starter - Photon",
    author: "Ondřej Chrastina <chrastina.ondra@gmail.com> (https://github.com/Simply007)",
    description: "A Gatsby.js Starter using Kentico Kontent based on Photon by HTML5 UP"
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: '@kentico/gatsby-source-kontent',
      options: {
        deliveryClientConfig: {
          projectId: '5e171834-8697-00d6-08fa-fdd643306171',
          globalQueryConfig: {
            usePreviewMode: true,
          },
          previewApiKey: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI0ZDYwYzVmMGI3NjU0Yzg2ODRiMTE5NjExZmIyYzRlOSIsImlhdCI6IjE1NTkwNjA2MDAiLCJleHAiOiIxOTA0NjYwNjAwIiwicHJvamVjdF9pZCI6IjVlMTcxODM0ODY5NzAwZDYwOGZhZmRkNjQzMzA2MTcxIiwidmVyIjoiMS4wLjAiLCJhdWQiOiJwcmV2aWV3LmRlbGl2ZXIua2VudGljb2Nsb3VkLmNvbSJ9.IgFxwaWUSOo8BzC4SJvnv2srvsE34Sg0dojhK4HoOKg',
          typeResolvers: []
        },
        languageCodenames: [
          `default`
        ],
        enableLogging: true,
        includeRawContent: true,
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'kontent-gatsby-template',
        short_name: 'kc-gatsby',
        start_url: '/',
        background_color: '#0087DC',
        theme_color: '#0087DC',
        display: 'minimal-ui',
        icon: 'src/assets/images/kentico-kontent.png', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-sass',
    'gatsby-plugin-offline'
  ],
}
