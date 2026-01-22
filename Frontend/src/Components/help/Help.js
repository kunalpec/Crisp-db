import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Help.module.css";
import images from "../../assets/images";
import NavBar from "../head/Navbar";

const faqData = [
  {
    question: "Question 1",
    answer:
      "Lorem ipsum dolor sit amet consectetur. Eu tortor eget sed amet tortor enim iaculis ultricies sit at arcu amet nisi scelerisque aliquam diam.",
  },
  {
    question: "Question 2",
    answer:
      "Lorem ipsum dolor sit amet consectetur. Eu tortor eget sed amet tortor enim iaculis ultricies sit at arcu amet nisi scelerisque aliquam diam.",
  },
  {
    question: "Question 3",
    answer:
      "Lorem ipsum dolor sit amet consectetur. Eu tortor eget sed amet tortor enim iaculis ultricies sit at arcu amet nisi scelerisque aliquam diam.",
  },
  {
    question: "Question 4",
    answer:
      "Lorem ipsum dolor sit amet consectetur. Eu tortor eget sed amet tortor enim iaculis ultricies sit at arcu amet nisi scelerisque aliquam diam.",
  },
];

const topics = [
  {
    id: 1,
    title: "Getting Started",
    description:
      "Best place to get everything right from the beginning with Mediator.",
    color: "#f25c5c",
  },
  {
    id: 2,
    title: "Install Mediator",
    description: "How to install Mediator on your website & apps.",
    color: "#3498db",
  },
  {
    id: 3,
    title: "Developers",
    description: "Documentation for our REST & JS APIs.",
    color: "#000000",
  },
  {
    id: 4,
    title: "Customization",
    description: "Adjust Mediator for your needs.",
    color: "#00bfa5",
  },
  {
    id: 5,
    title: "My Account",
    description:
      "Everything related to your account: avatar, password, notifications & more.",
    color: "#f39c12",
  },
  {
    id: 6,
    title: "Mediator Inbox",
    description: "How to reply to your users using Mediator Inbox.",
    color: "#9b59b6",
  },
  {
    id: 7,
    title: "Troubleshooting",
    description: "Having trouble? Find solutions here.",
    color: "#2b5971",
  },
  {
    id: 8,
    title: "Integrations",
    description:
      "How to use Mediator integrations with external services.",
    color: "#459c42",
  },
  {
    id: 9,
    title: "AI Chatbot & Automations",
    description:
      "Get the best Mediator Chatbot AI and Automations Hub.",
    color: "#000fac",
  },
  {
    id: 10,
    title: "Automate",
    description:
      "Automate Mediator to engage & target your visitors and users.",
    color: "#603418",
  },
  {
    id: 11,
    title: "Billing & Pricing",
    description: "Help with Mediator billing & pricing matters.",
    color: "#f25c5b",
  },
  {
    id: 12,
    title: "My Contacts",
    description: "Do more with your Mediator contacts.",
    color: "#68233a",
  },
];

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const handleCardClick = (topic) => {
    const slug = topic.title.toLowerCase().replace(/\s+/g, "-");
    navigate(`/help/${slug}`);
  };

  return (
    <>
      <NavBar />

      {/* Hero Section */}
      <section className={styles.helpmainHeroSection}>
        <div className={styles.helpmainHeroContainer}>
          <h1 className={styles.helpmainHeroTitle}>Help Center</h1>
          <p className={styles.helpmainHeroSubtitle}>
            Find answers and guidance
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <div className={styles.helpContainer}>
        <div className={styles.helpContent}>
          <div className={styles.helpLeft}>
            <h1 className={styles.helpHeading}>
              EVERYTHING YOU NEED TO KNOW ABOUT MEDIATOR
            </h1>
            <p className={styles.helpDescription}>
              Blandit nunc sapien orci egestas scelerisque mattis. Pulvinar
              pellentesque cursus ornare neque non mi pellentesque adipiscing
              mollis.
            </p>

            <div className={styles.helpFaqs}>
              {faqData.map((item, index) => (
                <div key={index} className={styles.helpFaqCard}>
                  <button
                    className={styles.helpFaqHeader}
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={openIndex === index}
                  >
                    <span className={styles.helpIconCircle}>
                      {openIndex === index ? "−" : "+"}
                    </span>
                    <span className={styles.helpQuestionText}>
                      {item.question}
                    </span>
                  </button>

                  {openIndex === index && (
                    <div className={styles.helpFaqBody}>
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className={styles.helpRight}>
            <img
              src={images.helpfaq}
              alt="AI assistant illustration"
              className={styles.helpImage}
            />
            <div className={styles.helpContactBox}>
              <div className={styles.helpPhone}>
                <span className={styles.helpIcon}>📞</span> +91 12345 67890
              </div>
              <button className={styles.helpContactBtn}>
                CONTACT US
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Categories */}
      <section className={styles.helpBrowseSectionWrapper}>
        <h2 className={styles.helpBrowseSectionHeading}>
          Browse All Categories
        </h2>

        <div className={styles.helpBrowseSectionGrid}>
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={styles.helpBrowseSectionCard}
              onClick={() => handleCardClick(topic)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.helpBrowseSectionIcon} />
              <div className={styles.helpBrowseSectionText}>
                <span
                  className={styles.helpBrowseSectionLabel}
                  style={{ backgroundColor: topic.color }}
                >
                  {topic.title}
                </span>
                <p className={styles.helpBrowseSectionDescription}>
                  {topic.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Help;
