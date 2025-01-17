import { GetServerSideProps } from "next"

import { QueryClient } from "@tanstack/react-query"

import { fetchGetSite } from "~/queries/site.server"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  ctx.res.setHeader("Content-Type", "application/json")

  const queryClient = new QueryClient()
  const domainOrSubdomain = ctx.params!.site as string
  const site = await fetchGetSite(domainOrSubdomain, queryClient)

  ctx.res.write(
    JSON.stringify({
      name: site.name,
      short_name: site.name,
      description: site.description,
      icons: [
        {
          src: site.avatars?.[0] || "assets/logo.png",
          type: "image/png",
          sizes: "any",
        },
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      start_url: "/",
      display: "standalone",
      orientation: "portrait",
    }),
  )
  ctx.res.end()

  return {
    props: {},
  }
}

const ManifestJson: React.FC = () => null

export default ManifestJson
