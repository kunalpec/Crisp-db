import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../head/Navbar";

import { motion } from "framer-motion";
import { Bot, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import styles from "./AiChatbotIntro.module.css";

export default function AiChatbotIntro() {
  const navigate = useNavigate();

  return (
   
  
  <>
  <NavBar />

    <div className={styles.page}>
      <div className={styles.container}>
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.left}
        >
          <div className={styles.badge}>
            <Bot size={26} />
            <span>AI CHATBOT</span>
          </div>

          <h1 className={styles.heading}>
            Smart Conversations.
            <br />
            <span>Powered by AI.</span>
          </h1>

          <p className={styles.description}>
            Crisp-style AI chatbot that helps you manage conversations, reply
            faster, and deliver human-like support with artificial intelligence.
          </p>

          <div className={styles.actions}>
            <Button
              size="lg"
              className={styles.primaryBtn}
              onClick={() => navigate("/inbox")}
            >
              Get Started
            </Button>

            <Button
              size="lg"
              variant="outline"
              className={styles.secondaryBtn}
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* RIGHT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.cards}
        >
          <FeatureCard
            icon={<Sparkles />}
            title="AI Replies"
            text="Generate smart replies automatically and reduce response time."
          />

          <FeatureCard
            icon={<Zap />}
            title="Fast Inbox"
            text="Unified inbox experience just like Crisp chat system."
          />

          <FeatureCard
            icon={<ShieldCheck />}
            title="Secure"
            text="Enterprise-level security for all conversations."
          />

          <FeatureCard
            icon={<Bot />}
            title="Human-like AI"
            text="Natural language understanding for real conversations."
          />
        </motion.div>
      </div>
    </div>
  </>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <Card className={styles.card}>
      <CardContent className={styles.cardContent}>
        <div className={styles.icon}>{icon}</div>
        <h3>{title}</h3>
        <p>{text}</p>
      </CardContent>
    </Card>
  );
}
