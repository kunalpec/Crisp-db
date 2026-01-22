import React,{useState,useEffect} from 'react'
import styles from './knowledgeTestimonials.module.css'

import images from '../../../assets/images';
import { checklist_items, reviews } from './KnowledgeData';


import { FaCheckCircle, FaPlus,FaStar } from 'react-icons/fa';
import Footer from '../../footer/Footer';

// import AiSolutions from './AISolutions';


 

const KnowledgeTestimonials = () => {


  const [activeReview, setActiveReview] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReview(prev => (prev + 1) % reviews.length);
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

// for knowldege checklist
   const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const review = reviews[activeReview];
  return (
    <>
         <section className={styles['testimonials-section']}>
      <div className={styles['testimonials-container']}>
        <div className={styles['testimonials-circleLayout']}>
          <img src={images.testimonialCircle} alt="Trustpilot" className={styles['testimonials-maincircle']} />
          <img src={images.circle2} alt="Client 1" className={`${styles['testimonials-client']} ${styles['testimonials-clientTop']}`} />
          <img src={images.circle2} alt="Client 2" className={`${styles['testimonials-client']} ${styles['testimonials-clientLeft']}`} />
          <img src={images.circle2} alt="Client 3" className={`${styles['testimonials-client']} ${styles['testimonials-clientRight']}`} />
          <img src={images.circle2} alt="Client 4" className={`${styles['testimonials-client']} ${styles['testimonials-clientBottom']}`} />
        </div>

       <div className={styles['testimonials-text']}>
          <h4 className={styles['testimonials-subHeading']}>TESTIMONIALS</h4>
          <h2 className={styles['testimonials-heading']}>What Our Clients Say About Us</h2>

          <p className={styles['testimonials-description']}>{review.text}</p>
          <h5 className={styles['testimonials-author']}>{review.author}</h5>
          <span className={styles['testimonials-designation']}>{review.designation}</span>
        </div>
      </div>
    </section>


{/* <section className={styles.reviews}>
      <h2>
        See their testimonials and reviews <br /> about Crisp knowledge base
      </h2>
      <div className={styles.reviewsGrid}>
        {reviews.map((item, index) => {
          if (item.type === "video") {
            return (
              <div key={index} className={styles.reviewsVideoCard}>
                <img src={images.robotanimate} alt="review image" />
                <span className={styles.reviewsBadge}>{item.name}</span>
              </div>
            );
          }

          if (item.type === "text") {
            return (
              <div key={index} className={styles.reviewsTextCard}>
                <p className={styles.reviewsAuthor}>
                  <strong>{item.name}</strong>
                  <br />
                  <span>{item.company}</span>
                </p>
                <p className={styles.reviewsQuote}>{item.quote}</p>
              </div>
            );
          }

          if (item.type === "quote") {
            return (
              <div key={index} className={styles.reviewsQuoteCard}>
                <blockquote>{item.quote}</blockquote>
              </div>
            );
          }

          if (item.type === "rating") {
            return (
              <div key={index} className={styles.reviewsRatingCard}>
                <div className={styles.reviewsStars}>
                  {[...Array(item.stars)].map(( i) => (
                    <FaStar key={i} color="#f03e3e" />
                  ))}
                </div>
                <p>{item.quote}</p>
              </div>
            );
          }

          return null;
        })}
      </div>
    </section>
 */}




 
    <section className={styles.section}>
      <h4 className={styles.subheading}>OUR PRODUCT</h4>
      <h2 className={styles.heading}>Recent AI solutions Product</h2>
      <p className={styles.description}>
        There are many variations of passages of Lorem Ipsum are many variations of passages of lorem Ipsum available but .suffered.
      </p>

      <div className={styles.cardsWrapper}>
        {/* LEFT CARD */}
        <div className={styles.card}>
          <div className={styles.content}>
            <h3>AI-Powered Business Solutions</h3>
            <p>
              <a href="#">AI chat bot</a> we are dedicated is the safeguarding your digital.
            </p>

            <ul className={styles.features}>
              <li><FaCheckCircle className={styles.icon} /> Advanced automation & analytics</li>
              <li><FaCheckCircle className={styles.icon} /> API access with higher rate limits</li>
            </ul>

            <button className={styles.demoButton}>
              <FaPlus /> Get a Demo
            </button>
          </div>

          <div className={styles.image}>
            <img src={images.robotanimate} alt="AI Solution" />
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className={styles.card}>
          <div className={styles.image}>
            <img src={images.knowledgeHeroImage} alt="Statistics Illustration" />
          </div>

          <div className={styles.statsBox}>
            <div className={styles.statItem}>
              <h3>25k+</h3>
              <p>Project Complete</p>
            </div>
            <div className={styles.statItem}>
              <h3>40m+</h3>
              <p>Data Inducted</p>
            </div>
          </div>
        </div>
      </div>
    </section>



    {/* knowledge checklist */}


     <section className={styles['checklist-wrapper']}>
      <h2 className={styles['checklist-heading']}>
        How to choose your next knowledge base system for customer service?
      </h2>
      <p className={styles['checklist-subtext']}>
        These 6 key elements are here to help companies navigate the competitive landscape of
        knowledge management systems.
      </p>

      <div className={styles['checklist-box']}>
        <div className={styles['checklist-left']}>
          <h3>Make sure your next provider checks these boxes!</h3>
          <p>
            To help companies choose the right tool, we've gathered 6 key factors.
          </p>
          <img
            src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
            alt="illustration"
            className={styles['checklist-illustration']}
          />
        </div>

        <div className={styles['checklist-right']}>
          {checklist_items.map((item, index) => (
            <div
              key={index}
              className={`${styles['checklist-accordionItem']} ${
                openIndex === index ? styles['checklist-open'] : ''
              }`}
              onClick={() => toggleItem(index)}
            >
              <div className={styles['checklist-accordionHeader']}>
                <span>
                  <FaCheckCircle className={styles['checklist-icon']} /> {item}
                </span>
                <FaPlus className={styles['checklist-plusIcon']} />
              </div>
              {openIndex === index && (
                <div className={styles['checklist-accordionContent']}>
                  <p>Details about {item}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>




{/* <div className={styles.knowledgeBrief}>
  <div className={styles.leftCard}>
    <img src={images.pricingFourthSection2}></img>
  </div>
  <div className={styles.rightCard}>
    <h1>
      Heading
    </h1>
    <p>paragraph</p>

  </div>
</div> */}


      


{/* <AiSolutions/> */}

{/* <Footer/> */}

    </>

  );
};


export default KnowledgeTestimonials
