module.exports = {
  siteMetadata: {
    title: "Gatsby Starter - Photon",
    author: "Hunter Chang",
    description: "A Gatsby.js Starter based on Photon by HTML5 UP"
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-kentico-cloud',
      options: {
        deliveryClientConfig: {
          projectId: '5e171834-8697-00d6-08fa-fdd643306171',
          enablePreviewMode: true,
          previewApiKey: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI0ZDYwYzVmMGI3NjU0Yzg2ODRiMTE5NjExZmIyYzRlOSIsImlhdCI6IjE1NTkwNjA2MDAiLCJleHAiOiIxOTA0NjYwNjAwIiwicHJvamVjdF9pZCI6IjVlMTcxODM0ODY5NzAwZDYwOGZhZmRkNjQzMzA2MTcxIiwidmVyIjoiMS4wLjAiLCJhdWQiOiJwcmV2aWV3LmRlbGl2ZXIua2VudGljb2Nsb3VkLmNvbSJ9.IgFxwaWUSOo8BzC4SJvnv2srvsE34Sg0dojhK4HoOKg',
          typeResolvers: []
        },
        languageCodenames: [
          `default`
        ]
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'kentico-cloud-gatsby-template',
        short_name: 'kc-gatsby',
        start_url: '/',
        background_color: '#0087DC',
        theme_color: '#0087DC',
        display: 'minimal-ui',
        icon: 'src/assets/images/kentico-cloud.png', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-sass',
    'gatsby-plugin-offline'
  ],
}
