import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./helpTopicArticles.module.css";

/* Articles mapped by slug (URL-safe) */
const articles = {
  "getting-started": [
    {
      title: "How to use the Mediator Inbox for the first time",
      summary: "Dedicated video overview for first-time users.",
    },
    {
      title: "Getting Started with Mediator for Customer Support",
      summary: "Everything you need to start with Mediator.",
    },
  ],

  "install-mediator": [
    {
      title: "Installing Mediator on your website",
      summary: "Step-by-step guide to install Mediator on any platform.",
    },
  ],

  developers: [
    {
      title: "Using Mediator JS SDK",
      summary: "Guide to integrate Mediator into your frontend apps.",
    },
  ],

  customization: [
    {
      title: "Customizing Mediator UI",
      summary: "How to customize Mediator UI to fit your brand.",
    },
  ],
};

const HelpTopicArticles = () => {
  const { topicName } = useParams();
  const navigate = useNavigate();

  const topicArticles = articles[topicName] || [];

  return (
    <section className={styles.helpBrowseSectionArticleView}>
      <button
        className={styles.helpBrowseSectionBackBtn}
        onClick={() => navigate("/help")}
        aria-label="Go back to help categories"
      >
        ← Back
      </button>

      <h3 className={styles.helpBrowseSectionArticleTitle}>
        Articles on:{" "}
        <span className={styles.topicName}>
          {topicName.replace(/-/g, " ")}
        </span>
      </h3>

      <div className={styles.helpBrowseSectionArticles}>
        {topicArticles.length > 0 ? (
          topicArticles.map((article, index) => (
            <article
              key={index}
              className={styles.helpBrowseSectionArticleCard}
            >
              <h4 className={styles.article_title}>{article.title}</h4>
              <p className={styles.article_summary}>{article.summary}</p>
            </article>
          ))
        ) : (
          <p className={styles.noArticles}>
            No articles available for this topic.
          </p>
        )}
      </div>
    </section>
  );
};

export default HelpTopicArticles;
