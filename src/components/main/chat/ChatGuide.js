import React, { useState, useEffect, useRef } from "react";
import TextArea from "../../TextArea";
import axios from "axios";
import Button from "../../Button";
const { messageGuide } = require("../../../constants");

function ChatGuide({ visible, onClose }) {
  const [chat, setChat] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);

  // Ref to track the chat container for scrolling
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  // Scroll to the bottom of the chat whenever new chat data is loaded
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const fetchChats = async () => {
    try {
      const email = localStorage.getItem("email");
      const response = await axios.get(`http://localhost:5000/chat-guide`, {
        params: { email: email },
      });

      setChat(response.data);
      console.log(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  const handleSend = async () => {
    try {
      const email = localStorage.getItem("email");
      if (!email) {
        console.error("Email not found in local storage");
        return;
      }

      setLoading(true);

      const payload = chat
        ? {
            id: chat._id,
            email: email,
            message: chat.message,
            response: [...chat.response, chatInput],
          }
        : {
            email: email,
            message: [messageGuide.initial],
            response: [chatInput],
          };

      const url = chat ? `https://backend-wm1d.onrender.com/chat-guide` : `https://backend-wm1d.onrender.com/chat-guide`;

      const response = chat ? await axios.put(url, payload) : await axios.post(url, payload);

      if (response.status === 200 || response.status === 201) {
        setChatInput("");
        fetchChats();
      } else {
        console.error("Unexpected response:", response.data);
      }
    } catch (error) {
      console.error("Failed to send chat:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!visible ? null : (
        <div className="flex flex-col mx-auto pb-5 bg-[#CAF0F8] rounded-lg shadow-lg p-6 w-full md:w-2/3" style={{ height: "80vh" }}>
          {/* Top Section - Buttons */}
          <div className="flex justify-between mb-5 space-x-4">
            <Button type="button" name="Back" onClick={onClose} className="bg-[#0077B6] hover:bg-[#00B4D8] text-white font-bold py-2 px-4 rounded-lg shadow-md" />
            <Button type="button" name="New Chat" onClick={() => setChat(null)} className="bg-[#0077B6] hover:bg-[#00B4D8] text-white font-bold py-2 px-4 rounded-lg shadow-md" />
          </div>

          {/* Chat Messages Section */}
          <div className="flex flex-col gap-4 overflow-y-auto mb-10 p-4 bg-white rounded-lg shadow-md" ref={chatContainerRef}>
            {!chat && (
              <div className="flex justify-start">
                <div className="rounded-lg p-3 bg-[#0077B6] text-white font-medium shadow-md w-2/3">
                  {messageGuide.initial}
                </div>
              </div>
            )}

            {chat && (
              <div className="flex flex-col gap-4 w-full">
                {chat.message !== "No chat messages found" &&
                  chat.message.map((message, index) => (
                    <div key={index}>
                      {/* AI Message */}
                      <div className="flex justify-start">
                        <div className="p-3 bg-[#0077B6] text-white rounded-md shadow-md w-2/3">
                          {message.includes("\n**") ? (
                            message.split("\n").map((line, idx) => {
                              if (line.startsWith("**")) {
                                return (
                                  <div key={idx}>
                                    <strong>{line.trim().replace(/\*+/g, "")}</strong>
                                    <br />
                                  </div>
                                );
                              } else if (line.startsWith("*")) {
                                return (
                                  <div key={idx}>
                                    {line.substring(0, 2)}
                                    <strong>{line.substring(2, line.lastIndexOf(":") + 1)}</strong>
                                    {line.substring(line.lastIndexOf(":") + 1)}
                                    <br />
                                  </div>
                                );
                              } else {
                                return (
                                  <div key={idx}>
                                    {line.trim()}
                                    <br />
                                  </div>
                                );
                              }
                            })
                          ) : (
                            <div>{message}</div>
                          )}
                        </div>
                      </div>

                      {/* User Response */}
                      {chat.response[index] && (
                        <div className="flex justify-end mt-3">
                          <div className="p-3 bg-[#CAF0F8] text-[#023E8A] rounded-md shadow-md w-2/3">
                            {chat.response[index]}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {loading ? <div className="mt-5 text-[#0077B6] font-semibold">Waiting...</div> : null}

          {/* Input Section */}
          {!chat?.disable && (
            <form className="flex flex-row mt-auto w-full" onSubmit={async (e) => {
                e.preventDefault();
                await handleSend();
              }}>
              <TextArea
                type="text"
                value={chatInput}
                setValue={setChatInput}
                placeholder="Type your message..."
                required={true}
                className="w-full border border-[#0077B6] rounded-l-md p-2 text-[#023E8A]"
              />
              <Button type="submit" name="Send" className="w-20 bg-[#0077B6] hover:bg-[#00B4D8] text-white font-bold py-2 px-4 rounded-r-md shadow-md transition-all duration-200" />
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default ChatGuide;
