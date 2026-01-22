import React from "react";
import NavBar from "../head/Navbar";
import styles from "./Apphero.module.css";
import images from "../../assets/images";
import Footer from "../footer/Footer";

import appFourSection1 from "../../assets/app/appFourSection1.png";
import appFourSection2 from "../../assets/app/appFourthSection2.png";
import appFourSection3 from "../../assets/app/appFourthSection3.png";

export default function Apphero() {
  const steps = [
    {
      title: "Sign Up",
      description: "Create your account in just a few clicks.",
    },
    {
      title: "Customize Your Chatbot",
      description: "Tailor the chatbot to meet your business needs.",
    },
    {
      title: "Train Chatbot",
      description: "Bring your resources and documentation, let AI learn it.",
    },
    {
      title: "Deploy and Engage",
      description:
        "Activate your AI assistant and start conversing with customers.",
    },
  ];

  const advantages = [
    {
      title: "Interact with customers, just like a human.",
      description: "Natural Language Understanding",
      image: appFourSection1,
    },
    {
      title: "Never miss an opportunity, even when you’re offline.",
      description: "24/7 Availability",
      image: appFourSection2,
    },
    {
      title: "Connect with your platforms effortlessly.",
      description: "Seamless Integration",
      image: appFourSection3,
    },
  ];

  return (
    <>
      <NavBar />

      {/* App Download Section */}
      <section className={styles.appDownloadSection}>
        <div className={styles.header}>
          <h1>
            Enjoy our customer service app for <br />
            mobile & desktop
          </h1>
        </div>

        <div className={styles.downloadOptions}>
          <div className={styles.optionWeb}>
            <div className={styles.iconWeb}>
              <img src={images.web} className={styles.web} alt="Web App" />
            </div>
            <p>Web</p>
            <button className={styles.buttonWeb}>Login to app</button>
          </div>

          <div className={styles.optionMac}>
            <div className={styles.iconMac}>
              <img src={images.mac} className={styles.mac} alt="Mac App" />
            </div>
            <p>Mac</p>
            <button className={styles.buttonMac}>
              Download for <span aria-hidden></span>
            </button>
          </div>

          <div className={styles.optionWindows}>
            <div className={styles.iconWindows}>
              <img src={images.window} className={styles.window} alt="Windows App" />
            </div>
            <p>Windows</p>
            <button className={styles.buttonWindows}>Download for 🪟</button>
          </div>

          <div className={styles.optionIphone}>
            <div className={styles.iconIphone}>
              <img src={images.iphone} className={styles.iphone} alt="iPhone App" />
            </div>
            <p>iPhone</p>
            <button className={styles.buttonIphone}>Download for </button>
          </div>

          <div className={styles.optionAndroid}>
            <div className={styles.iconAndroid}>
              <img src={images.android} className={styles.android} alt="Android App" />
            </div>
            <p>Android</p>
            <button className={styles.buttonAndroid}>Download for 🤖</button>
          </div>
        </div>
      </section>

      {/* Exclusive Services Section */}
      <section className={styles.exclusiveSection}>
        <div className={styles.header}>
          <h1>
            Exclusive <span className={styles.highlight}>AI-Powered</span> <br />
            Idea & <span className={styles.highlight}>Automation</span> Services
          </h1>
        </div>

        {[1, 2].map((row) => (
          <div key={row} className={styles.servicesContainer}>
            {[1, 2].map((card) => (
              <div key={card} className={styles.serviceCard}>
                <div className={styles.imageWrapper}>
                  <img
                    src={images[`appimage${row * 2 + card - 2}`]}
                    alt="Business Service"
                    className={styles.image}
                  />
                </div>

                <div className={styles.textWrapper}>
                  <div className={styles.textContent}>
                    <h2>Business Strategy Planning</h2>
                    <p>
                      Duis sagittis risus ac magna. One-stop solutions designed
                      to accelerate your growth.
                    </p>
                    <a href="#" className={styles.moreLink}>
                      More Details ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* Advantages Section */}
      <section className={styles.appFourSection}>
        <h1 className={styles.title}>It’s Not Just a Chatbot</h1>
        <p className={styles.subtitle}>
          Discover the unique advantages of choosing HAIchat for your business.
        </p>

        <div className={styles.cardsContainer}>
          {advantages.map((advantage, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconContainer}>
                <img
                  src={advantage.image}
                  alt={advantage.title}
                  className={styles.icon}
                />
              </div>
              <h2 className={styles.cardTitle}>{advantage.title}</h2>
              <p className={styles.cardDescription}>
                {advantage.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps Section */}
      <section className={styles.appThird}>
        <div className={styles.leftPanel}>
          <button className={styles.joinBtn}>LET’S JOIN</button>
          <h1 className={styles.heading}>It’s Time to Hire</h1>
          <h2 className={styles.subheading}>AI Customer Services</h2>
          <p className={styles.description}>
            Hiring AI customer services is easy when you understand your
            business needs.
          </p>

          <div className={styles.buttonsGroup}>
            <button className={styles.learnMore}>Learn More</button>
            <button className={styles.signUpNow}>Sign Up Now</button>
          </div>
        </div>

        <div className={styles.rightPanel}>
          {steps.map((step, index) => (
            <div key={index} className={styles.stepBox}>
              <div className={styles.stepNumber}>{`0${index + 1}`}</div>
              <div className={styles.stepContent}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
