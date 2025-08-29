# Sahara: Mental Health Support Application with Emotion Classification using DistilBERT

## Overview

Sahara is an AI-powered mobile application designed to provide accessible and personalized mental health support, particularly addressing barriers in under-resourced and stigmatized communities like Nepal. The app integrates AI-driven tools with human-centered care, enabling users to track their emotional well-being through daily journaling, mood and sleep tracking, and connections to certified counselors.

Developed as a major project for the **Bachelor of Engineering in IT Engineering** at **Nepal College of Information Technology (affiliated with Pokhara University)**, Sahara uses a fine-tuned **DistilBERT** model for emotion classification. The frontend is built with **React Native**, while the backend leverages **Express.js** and **Flask**. Key integrations include a chatbot powered by **Gemini**, a secure payment gateway via **eSewa**, and video call sessions for counseling.

By combining scalable AI technologies with professional oversight, Sahara aims to revolutionize mental healthcare in Nepal, fostering inclusivity, affordability, and stigma-free access.


---

## Features

* **Daily Journaling with Emotion Classification:** Users can log daily entries, with AI (fine-tuned DistilBERT) analyzing text to classify emotions and provide mood insights.
* **Mood and Sleep Tracking:** Tools to monitor emotional well-being and sleep patterns over time.
* **Counselor Booking System:** Search, book, and schedule sessions with certified counselors, including real-time video calls.
* **Feedback and Rating System:** Users can rate counselors and provide feedback to ensure quality.
* **Secure Payment Gateway:** Integrated with eSewa for affordable, secure transactions.
* **AI Chatbot:** Powered by Gemini for instant, conversational mental health support.

### Role-Based Access

* **Users:** Journaling, Sleep tracking, booking sessions, chatbot interaction.
* **Counselors:** Manage availability, accept bookings, conduct sessions.
* **Admins:** Onboard certified counselors, monitor platform activities.


---

## Technologies Used

| Category    | Technologies/Tools                                                       |
| ----------- | ------------------------------------------------------------------------ |
| Frontend    | React Native                                                             |
| Backend     | Node.js, Express.js, Python, Flask                                       |
| Database    | MongoDB with Mongoose                                                    |
| AI/ML       | DistilBERT (fine-tuned for emotion classification), Gemini (for chatbot) |
| Testing/Dev | Postman, VSCode, Figma (for UI design), Git & GitHub                     |
| Others      | LaTeX (for documentation), eSewa (payment gateway)                       |

---

## Development Approach

The project follows an **Incremental Software Development Life Cycle (SDLC)**, with iterations focusing first on core features like journaling and emotion detection, followed by advanced integrations like video sessions and secure payments.

## Usage

### User Flow

* Sign up/login
* Add daily journals for emotion analysis
* Track sleep and mood
* Browse and book counselors
* Join video sessions
* Interact with the chatbot

### Counselor Flow

* Register (via admin )
* Set availability
* Manage bookings
* Conduct sessions

### Admin Flow

* Onboard certified counselors
* Oversee user/counselor management through the dashboard

