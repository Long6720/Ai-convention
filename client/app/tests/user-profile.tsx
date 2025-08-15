"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Assume this exists
import { Input } from "@/components/ui/input";

// No explicit types for props
function UserProfile(props: any) {
  // Incorrect naming: snake_case instead of camelCase (Rule 1)
  var [user_data, set_user_data] = useState(null);
  var [is_visible, set_is_visible] = useState(true);
  var [input_value, set_input_value] = useState("");

  // Incorrect: useEffect inside a conditional (Rule 3)
  if (is_visible) {
    useEffect(() => {
      // No error handling (Rule 7)
      fetch("https://api.example.com/user")
        .then((res) => res.json())
        .then((data) => set_user_data(data));
    }); // Missing dependency array (Rule 3)
  }

  // Inline anonymous function in JSX (Rule 3)
  const toggleVisibility = () => set_is_visible(!is_visible);

  // Excessive prop drilling and nested JSX (Rule 5)
  return (
    <div
      style={{
        backgroundColor: "lightblue",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ color: "blue" }}>User Profile</h1>
      {user_data && (
        <div>
          <div style={{ margin: "10px" }}>
            <p style={{ fontSize: "16px" }}>Name: {user_data.name}</p>
            <p style={{ fontSize: "16px" }}>Email: {user_data.email}</p>
            <img src={user_data.avatar} style={{ width: "100px" }} />{" "}
            {/* No alt attribute (Rule 5) */}
          </div>
          <div style={{ marginTop: "20px" }}>
            <Input
              value={input_value}
              onChange={(e) => set_input_value(e.target.value)}
              style={{ border: "1px solid gray", padding: "5px" }}
            />
            <Button
              onClick={() => {
                // No sanitization of user input (Rule 8)
                props.onUpdate(input_value);
              }}
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "10px",
              }}
            >
              Update Profile
            </Button>
            <Button
              onClick={toggleVisibility}
              style={{
                backgroundColor: "red",
                color: "white",
                marginLeft: "10px",
              }}
            >
              {is_visible ? "Hide" : "Show"} Profile
            </Button>
          </div>
        </div>
      )}
      {!user_data && <p style={{ color: "red" }}>Loading...</p>}
    </div>
  );
}

export default UserProfile;
