import React from 'react'
import styles from './Coversationchatbot.module.css'
import Footer from '../footer/Footer'
import LeverageChat from './LeverageChat'
import images from '../../assets/images'


const Conversationchatbot =()=> {
  return (
    <div>
        <div className={styles.chatbotContainer}>
      <div className={styles.mediatordiv}>
      <div className={styles.integrationcontent}>
      <div className={styles.integrationLabel}>•• INTEGRATION</div>
      <h1 className={styles.chatbotTitle}>Conversational Chatbot</h1>
      </div>

      <div className={styles.mediatertext}>
      <p className={styles.placeholderText}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
      </p>
      </div>
      </div>
      <div className={styles.skillabText}>Mediator</div>
      
      <div className={styles.integrationGrid}>
        <div style={{ top: '20%', left: '5%' }} className={styles.appdiv}>
        <div><button className={styles.integrationButton}>facebook</button></div>
          <img src={images.facebook} className={styles.app} alt="whatsapp"/>
          
        </div>

        <div style={{ top: '42%', left: '-10%' }} className={styles.appdiv}>
        <div><button className={styles.integrationButton}>WhatsApp</button></div>
          <img src={images.whatsapp} className={styles.app} alt="whatsapp"/>
          
        </div>
        
        
        <div style={{ top: '35%', left: '20%' }} className={styles.appdiv}>
        <div><button className={styles.integrationButton}>Twiter</button></div>
          <img src={images.twiter} className={styles.app} alt="whatsapp"/>
          
        </div>

        <div style={{ top: '40%', left: '50%' }} className={styles.appdiv}>
        <div><button className={styles.integrationButton}>Gmail</button></div>
          <img src={images.gmail} className={styles.app} alt="whatsapp"/>
          
        </div>


        <div style={{ top: '60%', left: '70%' }} className={styles.appdiv}>
        <div><button className={styles.integrationButton}>YouTube</button></div>
          <img src={images.youtube} className={styles.app} alt="whatsapp"/>
          
        </div>

        <div style={{ top: '20%', left: '80%' }} className={styles.appdiv}>
        <div><button className={styles.integrationButton}>Instagram</button></div>
          <img src={images.instagram} className={styles.app} alt="whatsapp"/>
          
        </div>
        
          <div style={{ top: '40%', left: '50%' }} className={styles.appdiv}>
        <div><button className={styles.integrationButton}>Gmail</button></div>
          <img src={images.gmail} className={styles.app} alt="whatsapp"/>
          
        </div>
        
            
        <div style={{ top: '60%', left: '20%' }} className={styles.appdiv}>
        <div><button className={styles.integrationButton}>Telegram</button></div>
          <img src={images.telegram} className={styles.app} alt="whatsapp"/>
          
        </div>

      </div>
    </div>
    <LeverageChat/>
    
    <Footer/>
    </div>
  )
}

export default Conversationchatbot
