import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();
let producer;
export const connectKafka = async () => {
  try {
    const kafka = new Kafka({ clientId: "job-service", brokers: [process.env.KAFKA_BROKER || "localhost:9092"] });
    const admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    if (!topics.includes("send-mail")) await admin.createTopics({ topics: [{ topic: "send-mail", numPartitions: 1, replicationFactor: 1 }] });
    await admin.disconnect();
    producer = kafka.producer();
    await producer.connect();
  } catch (error) {
    console.log("Failed to connect to kafka", error?.message || error);
  }
};
export const publishToTopic = async (topic, message) => { if (!producer) return; await producer.send({ topic, messages: [{ value: JSON.stringify(message) }] }); };
