import { QueryClient } from "@tanstack/react-query"

import { getSiteLink } from "~/lib/helpers"
import { PageVisibilityEnum } from "~/lib/types"
import { renderPageContent } from "~/markdown"
import { fetchGetPagesBySite } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export const getJsonFeed = async (domainOrSubdomain: string, path: string) => {
  const queryClient = new QueryClient()

  const site = await fetchGetSite(domainOrSubdomain, queryClient)
  const pages = await fetchGetPagesBySite(
    {
      site: domainOrSubdomain,
      type: "post",
      visibility: PageVisibilityEnum.Published,
      keepBody: true,
    },
    queryClient,
  )

  const hasAudio = pages.list?.find((page: any) => page.audio)

  const link = getSiteLink({
    subdomain: site.username || "",
  })
  return {
    version: "https://jsonfeed.org/version/1",
    title: site.name,
    description: site.description,
    icon: site.avatars?.[0],
    home_page_url: link,
    feed_url: `${link}${path}`,
    ...(hasAudio && {
      _itunes: {
        image: site.avatars?.[0],
        author: site.name,
        summary: site.description,
      },
    }),
    items: pages.list?.map((page: any) => ({
      id: page.id,
      title: page.title,
      content_html:
        page.body?.content &&
        renderPageContent(page.body?.content, true).contentHTML,
      summary: page.summary?.content,
      url: `${link}/${page.slug || page.id}`,
      image: page.cover,
      date_published: page.date_published,
      date_modified: page.date_updated,
      tags: page.tags,
      author: site.name,
      ...(page.audio && {
        _itunes: {
          image: page.cover,
          summary: page.summary?.content,
        },
        attachments: [
          {
            url: page.audio,
            mime_type: "audio/mpeg",
            title: page.title,
          },
        ],
      }),
    })),
  }
}
