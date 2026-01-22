import React,{ useState } from 'react';
import styles from './LeverageChat.module.css';
import images from '../../assets/home/cardCornerImage.png'

const MainContent = () => {

   const faqs = [
      {
        id: 1,
        question: "What Type Of Websites Can I Build With This Theme?",
        answer: "You can build a variety of websites such as business, portfolio, e-commerce, blog, and more with this theme. It’s highly customizable to suit your needs."
      },
      {
        id: 2,
        question: "Will I Get All The Demos For Single Purchase With Lifetime Validity?",
        answer: "Yes, with a single purchase, you get access to all demos with lifetime validity, including future updates and support."
      },
      {
        id: 3,
        question: "Can I Change The Theme Language To My Local Language?",
        answer: "Absolutely! The theme supports multi-language options, and you can easily integrate your local language using translation plugins."
      },
      {
        id: 4,
        question: "Why The Price Of Aiglobe Is Affordable Compared To Other Themes Providing Similar Features?",
        answer: "Aiglobe offers competitive pricing by optimizing development costs and providing a streamlined feature set without compromising quality."
      },
      {
        id: 5,
        question: "Is There A Money-Back Guarantee?",
        answer: "Yes, we offer a 30-day money-back guarantee if you’re not satisfied with the theme."
      },
      {
        id: 6,
        question: "How Can I Get Support For Customization?",
        answer: "You can reach our support team via email or our dedicated support portal for assistance with customization."
      },
      {
        id: 7,
        question: "Can I Use This Theme For Multiple Websites?",
        answer: "The license allows use on a single site. For multiple sites, you’ll need to purchase additional licenses."
      }
    ];
  const [expanded, setExpanded] = useState(null);


  const handleToggle = (id) => {
    setExpanded(expanded === id ? null : id);
  };
  return (
    <>
      <div className={styles["main-content"]}>
      <div className={styles["content-wrapper"]}>
        <div className={styles["text-section"]}>
          <h1>Leverage a chatbot API to build an AI Chatbot</h1>
          <p>
            Want to go deeper than the usual chatbot platform? Modern solutions like Mediator
            let you craft AI-native workflows using a dedicated chatbot API. Available in 5
            different API libraries, we’ve made it easier for you to connect your data to our
            customer service platform. Simply connect a third-party LLM tool such as
            Dialogflow, OpenAI, Llama or Claude to bring AI to your customer experience!
          </p>
          <button className={styles["learn-more-btn"]}>Learn More</button>
        </div>
        <div className={styles["code-section"]}>
          <div className={styles["code-block"]}>
            <div className={styles["code-circle"]}>
              <span className={styles.circle}></span>
              <span className={styles.circle}></span>
              <span className={styles.circle}></span>
              <hr className={styles.hello}></hr>
            </div>
            <pre>
              <code>
{`// Receive a message from a visitor
crispClient.on("message:send", async (message) => {
  const sessionId = message.session_id;
  const userMessage = message.content;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [ { role: "user", content: userMessage } ]
  });

  const aiReply = response.choices[0].message.content;

  crispClient.website.sendMessageInConversation(
    message.website_id,
    sessionId,
    {
      type: "text",
      content: aiReply,
      from: "operator",
      origin: "chat"
    }
  );
});
`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>

    <div>
        
<div className={styles.faqContainer}>
      <header className={styles.faqHeader}>
        <h1 className={styles.faqTitle}>How Can We Help You?</h1>
        <p className={styles.faqSubtitle}>
          We understand that you have questions, and we welcome them. Below is the collection of queries which comes frequently from our clients.
        </p>
      </header>

      <main className={styles.faqMain}>
        {faqs.map((faq) => (
          <div key={faq.id} className={styles.faqItem}>
            <div
              className={styles.faqQuestion}
              onClick={() => handleToggle(faq.id)}>
              <span>{faq.id}. {faq.question}</span>
              <span className={`${styles.arrow} ${expanded === faq.id ? styles.arrowUp : ''}`}>›</span>
            </div>

            {expanded === faq.id && (
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>

    <div>
    <section className={styles.faqNextContainer}>
      <div className={styles.left}>
        <h1 className={styles.title}>This is Where the World Hires</h1>
        <p className={styles.subtitle}>
          It is a long established fact that a reader will be distracted. It is a long established fact that a reader will be distracted.
        </p>
        <button className={styles.videoButton}>
          <span className={styles.playIcon}>▶</span>
          Watch Video
        </button>
      </div>

      <div className={styles.right}>
        <div className={`${styles.card} ${styles.blue}`} style={{ backgroundImage: `url(${images.cornerImage})` }}>
          <h2 className={styles.number}>20k</h2>
          <p className={styles.label}>Companies</p>
        </div>
        <div>
          <div className={`${styles.card} ${styles.green}`} style={{ backgroundImage: `url(${images.cornerImage})` }}>
            <h2 className={styles.number}>10M</h2>
            <p className={styles.label}>Hires</p>
          </div>
          <div className={`${styles.card} ${styles.red}`} style={{ backgroundImage: `url(${images.cornerImage})` }}>
            <h2 className={styles.number}>100M</h2>
            <p className={styles.label}>Candidates</p>
          </div>
        </div>
      </div>
    </section>
    </div>
    </div>
    </>
  );
};

export default MainContent;

