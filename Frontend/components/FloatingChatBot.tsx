import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Camera, Leaf, Bot, User } from "lucide-react";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
    image?: string;
}

export const FloatingChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hello! I'm your plant health assistant. Upload a leaf image and I'll help you identify potential diseases and provide treatment recommendations.",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(inputText),
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);
            setIsTyping(false);
        }, 1000);
    };

    const getBotResponse = (userInput: string): string => {
        const input = userInput.toLowerCase();

        if (
            input.includes("disease") ||
            input.includes("sick") ||
            input.includes("problem")
        ) {
            return "I can help identify plant diseases! Please upload a clear image of the affected leaf. Make sure the image shows the symptoms clearly - spots, discoloration, or unusual patterns.";
        }

        if (
            input.includes("upload") ||
            input.includes("image") ||
            input.includes("photo")
        ) {
            return "You can upload images by clicking the camera icon or dragging and dropping files. I accept JPG, PNG, and other common image formats.";
        }

        if (
            input.includes("treatment") ||
            input.includes("cure") ||
            input.includes("help")
        ) {
            return "Once I analyze your leaf image, I'll provide specific treatment recommendations including organic and chemical options, prevention tips, and care instructions.";
        }

        return "I'm here to help with plant disease identification! Upload a leaf image or ask me questions about plant health, diseases, or treatments.";
    };

    const handleImageUpload = (file: File) => {
        const imageUrl = URL.createObjectURL(file);

        const userMessage: Message = {
            id: Date.now().toString(),
            text: "I've uploaded an image for analysis.",
            sender: "user",
            timestamp: new Date(),
            image: imageUrl,
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        // Simulate image analysis
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "I can see your leaf image! Based on the visual analysis, I notice some concerning symptoms. This appears to be a fungal infection, possibly leaf spot disease. I recommend:\n\n• Remove affected leaves immediately\n• Apply a copper-based fungicide\n• Improve air circulation around the plant\n• Avoid watering the leaves directly\n\nWould you like more specific treatment options?",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);
            setIsTyping(false);
        }, 2000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            handleImageUpload(file);
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <div className="fixed bottom-6 right-6 z-50">
                {!isOpen && (
                    <div className="flex flex-col items-end space-y-2">
                        {/* Get Support Text */}
                        <div className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200 text-sm text-gray-700 font-medium animate-pulse">
                            Get Support
                        </div>
                        {/* Chat Button */}
                        <button
                            onClick={() => setIsOpen(true)}
                            className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-bounce"
                        >
                            <MessageCircle className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>

            {/* Chat Interface */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[500px] z-50 flex flex-col bg-white rounded-lg shadow-xl border border-gray-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Leaf className="w-5 h-5" />
                            <h3 className="font-semibold">
                                Plant Health Assistant
                            </h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-green-700 p-1 rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${
                                        message.sender === "bot"
                                            ? "justify-start"
                                            : "justify-end"
                                    }`}
                                >
                                    {message.sender === "bot" && (
                                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[80%] ${
                                            message.sender === "bot"
                                                ? "order-2"
                                                : "order-1"
                                        }`}
                                    >
                                        <div
                                            className={`p-3 rounded-lg ${
                                                message.sender === "bot"
                                                    ? "bg-gray-100 text-gray-800"
                                                    : "bg-green-600 text-white"
                                            }`}
                                        >
                                            {message.image && (
                                                <div className="mb-2">
                                                    <img
                                                        src={message.image}
                                                        alt="Uploaded leaf"
                                                        className="max-w-full h-auto rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                                {message.text}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 px-1">
                                            {message.timestamp.toLocaleTimeString(
                                                [],
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }
                                            )}
                                        </p>
                                    </div>

                                    {message.sender === "user" && (
                                        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                                    <div
                                        className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.1s" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    ></div>
                                    <span className="text-sm">
                                        Analyzing...
                                    </span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                        <div className="flex gap-2 mb-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                title="Upload image"
                            >
                                <Camera className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about plant diseases..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputText.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingChatBot;
