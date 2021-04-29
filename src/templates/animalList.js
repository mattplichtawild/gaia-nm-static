import React from "react"
import { graphql } from "gatsby"
import styled from "styled-components"
import { useLocalJsonForm } from "gatsby-tinacms-json"
// import { usePlugin } from "tinacms"
// import { useJsonForm } from "gatsby-tinacms-json"
import Img from "gatsby-image"

import {
  Grid,
  Paper,
  Meta,
  MetaSpan,
  MetaActions,
  DraftBadge,
} from "../components/style"
import { ListAuthors, AuthorsForm } from "../components/authors"
import { TagsForm } from "../components/tags"
import { Link } from "gatsby"
import { PageLayout } from "../components/pageLayout"

export default function AnimalList({ data, pageContext }) {
  const [tags] = useLocalJsonForm(data.tags, TagsForm)
  const [authors] = useLocalJsonForm(data.authors, AuthorsForm)

  const [page] = useLocalJsonForm(data.page, ListForm)

//   const [ page, form] = useJsonForm({ data, pageContext })

//   usePlugin(form)


  const { slug, limit, skip, numPages, currentPage } = pageContext
  const isFirst = currentPage === 1
  const isLast = currentPage === numPages
  const prevPage =
    currentPage - 1 === 1 ? slug : slug + "/" + (currentPage - 1).toString()
  const nextPage = slug + "/" + (currentPage + 1).toString()
  page.title = isFirst ? page.title : page.title + " - " + currentPage
 
  return (
    <PageLayout page={page}>
      <>
      <Grid >
        {data.posts &&
          data.posts.edges.map((item) => {
            return (
              <Paper animal key={item.node.id}>
                <Img fluid={item.node.frontmatter.hero && item.node.frontmatter.hero.image.childImageSharp.fluid} alt="" />
                {item.node.frontmatter.draft && <DraftBadge>Draft</DraftBadge>}
                <h2>
                  <Link to={item.node.frontmatter.path}>
                    {item.node.frontmatter.title}
                  </Link>
                </h2>
                {/* <p>{item.node.frontmatter.dob}</p> */}
                <Meta>
                  {/* <MetaSpan>{item.node.frontmatter.date}</MetaSpan> */}
                  {/* {item.node.frontmatter.authors && (
                    <MetaSpan>
                      <em>By</em>&nbsp;
                      <ListAuthors authorIDs={item.node.frontmatter.authors} />
                    </MetaSpan>
                  )} */}
                  <MetaActions>
                    <Link to={item.node.frontmatter.path}>See More →</Link>
                  </MetaActions>
                </Meta>
              </Paper>
            )
          })}
      </Grid>
        <ListNav>
          {!isFirst && (
            <Link to={prevPage} rel="prev">
              ← Newer
            </Link>
          )}
          {!isLast && (
            <Link to={nextPage} rel="next">
              Older →
            </Link>
          )}
        </ListNav>
      </>
    </PageLayout>
  )
}

export const pageQuery = graphql`
  query($listType: String!, $slug: String!, $skip: Int!, $limit: Int!) {
    page: pagesJson(path: { eq: $slug }) {
      path
      title
      hero {
        headline
        textline
        large
        overlay
        ctas {
          label
          link
          primary
          arrow
        }
        image {
          childImageSharp {
            fluid(quality: 70, maxWidth: 1920) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
      listType
      rawJson
      fileRelativePath
    }
    posts: allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: {
        frontmatter: { type: { eq: $listType } }
        published: { eq: true }
      }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          id
          excerpt
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            path
            title
            draft
            tags
            dob
            hero {
              image {
                childImageSharp {
                  fluid(quality: 70, maxWidth: 800) {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
            }
          }
        }
      }
    }
    authors: settingsJson(
      fileRelativePath: { eq: "/content/settings/authors.json" }
    ) {
      ...authors

      rawJson
      fileRelativePath
    }
    tags: settingsJson(
      fileRelativePath: { eq: "/content/settings/tags.json" }
    ) {
      ...tags

      rawJson
      fileRelativePath
    }
  }
`

export const ListNav = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;

  a {
    display: inline-block;
    padding: 0.5rem 1rem;
  }
`

const ListForm = {
  label: "Page",
  fields: [
    {
      label: "Title",
      name: "rawJson.title",
      component: "text",
    },
    {
      label: "Hero",
      name: "rawJson.hero",
      component: "group",
      fields: [
        {
          label: "Headline",
          name: "headline",
          component: "text",
        },
        {
          label: "Textline",
          name: "textline",
          component: "text",
        },
        {
          label: "Image",
          name: "image",
          component: "image",
          parse: (filename) => `../images/${filename}`,
          uploadDir: () => `/content/images/`,
          previewSrc: (formValues) => {
            if (!formValues.jsonNode.hero || !formValues.jsonNode.hero.image)
              return ""
            return formValues.jsonNode.hero.image.childImageSharp.fluid.src
          },
        },
        {
          label: "Actions",
          name: "ctas",
          component: "group-list",
          itemProps: (item) => ({
            key: item.link,
            label: item.label,
          }),
          fields: [
            {
              label: "Label",
              name: "label",
              component: "text",
            },
            {
              label: "Link",
              name: "link",
              component: "text",
            },
            {
              label: "Primary",
              name: "primary",
              component: "toggle",
            },
            {
              label: "Arrow",
              name: "arrow",
              component: "toggle",
            },
          ],
        },
        {
          label: "Large",
          name: "large",
          component: "toggle",
        },
      ],
    },
  ],
}
