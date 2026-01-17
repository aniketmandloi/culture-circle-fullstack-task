# Full-Stack Developer Technical Assessment

## AI-Powered Outfit Recommendation System

**Time Limit:** 6–8 hours (take-home)

**Tech Stack:** **Open choice** — candidates may use any backend, frontend, database, or AI/ML tools they prefer.

---

## 📋 Project Overview

You are required to design and implement an **AI-powered Outfit Recommendation System** that generates **complete outfit combinations** using a **single base product** as input.

The system should simulate how a fashion stylist thinks — considering:

- Style compatibility
- Color harmony
- Occasion appropriateness
- Seasonal relevance
- Budget constraints

The goal is **not UI perfection**, but **clear system design, reasoning quality, performance awareness, and implementation clarity**.

---

## 🎯 Core Challenge

## ⚡ Performance Requirement (Mandatory)

- The **API response time must be under 1 second** for a typical request.
- This includes:
  - Recommendation generation
  - Scoring
  - AI reasoning (if synchronous)

Candidates are expected to **design for performance**, for example by:

- Precomputing or caching recommendations
- Using async/background processing
- Using lightweight or hybrid AI approaches
- Returning cached or partially pre-generated results

---

## 🧠 Functional Requirements

### 1. Outfit Generation Logic

- Each outfit must include:
  - Top
  - Bottom
  - Footwear
  - At least one accessory
- Items must be **compatible in color, style, and occasion**
- Generate **distinct outfits**, not small variations of the same look

---

---

### 2. Scoring & Ranking

- Assign a `match_score` (0–1) indicating overall outfit quality
- Clearly explain (in README or comments) how the score is calculated
  Example factors:
  - Color harmony
  - Style match
  - Season fit
  - Budget alignment

---

### 3. Data Modeling

- Design a reasonable data structure for:
  - Products
  - Categories
  - Attributes (color, price range, season, style)
- Real data is **not required**; mock or static data is acceptable

---

### 4. API / Interface

- Expose a clear interface to generate recommendations:
  - REST, GraphQL, CLI, or UI — your choice
- Should be easy to test and understand
- Must consistently meet the **< 1 second response time requirement**

---

## 🏗️ System Design Expectations

Candidates should demonstrate:

- Clear separation of concerns
- Thoughtful backend architecture
- Clean and readable code
- Sensible abstractions for recommendation logic
- Scalability and performance considerations

---

## 📦 Submission Format (Important)

### 1. Code Repository

Submit a **GitHub/GitLab repository** containing:

- All source code
- Configuration files
- Sample data (if used)

---

### 2. README.md (Mandatory)

Your README must include:

**a. Project Overview**

Brief explanation of what you built

**b. Architecture Explanation**

High-level system design and data flow

**c. Recommendation Logic**

How outfits are generated, filtered, and ranked

**d. Performance Strategy**

How the system achieves **sub-1s response time**

What is cached, precomputed, or async

**e. AI Usage (if any)**

What AI/ML techniques or APIs were used and why

**f. How to Run**

Local setup instructions

Sample request and response

**g. Assumptions & Trade-offs**

What was simplified and what you would improve

---

### 3. Demo

- Hosted API endpoint, deployed app, or
- Short Loom / screen recording explaining the system

---

## 🧪 Evaluation Criteria

Candidates will be evaluated on:

- System design and architectural thinking
- Performance awareness and optimization
- Quality of recommendation logic
- Clarity of AI reasoning
- Code readability and structure
- Communication through documentation

---

## 🚫 Constraints

- No fixed tech stack
- Focus on **thinking, logic, performance, and design**, not polish

### Products data :

https://docs.google.com/spreadsheets/d/1bSdUJsST5sgi2brk1AFDKz0TS9zafaMT2_DJQHFsOWI/edit?usp=sharing

or I have Downloaded the Data in data folder

For Reference:

Check Images in sampleImages folder
