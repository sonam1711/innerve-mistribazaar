# innerve-mistribazaar

# Mistribazaar – Digital Platform for Construction & Home Building

Mistribazaar is a digital platform designed to connect construction professionals, contractors, and customers in one powerful ecosystem.
Our goal is to make building, renovating, and managing home projects easy, transparent, and efficient.

Mistribazaar bridges the gap between homeowners and verified construction experts using technology, AI, and smart project management.

# Key Features 

# 1. Find Verified Professionals (Nearby)

Users can easily discover nearby:

Carpenters

Electricians

Plumbers

Painters

Masons

Interior workers

All professionals are verified and searchable using location-based filtering (within a 10 km radius).

# 2.  Contractor Bidding System

For large projects such as:

House construction

Flat renovation

Building projects

Interior works

Users can post project details, and contractors can place competitive bids.
This ensures:

Fair pricing

Transparency

Quality service selection

# 3. AI-Based House Design & Planning

Users can create their dream home digitally:

Personalized house layout

Room size planning

Area-wise breakdown

2D house maps

3D house visualizations

This helps users visualize their house before construction begins, reducing mistakes and cost overruns.

# 4. AI Customer Support Chatbot

Mistribazaar includes an AI-powered chatbot that:

Answers user queries

Guides users through the platform

Helps with project creation

Assists in finding workers and contractors

This provides 24/7 customer support without human dependency.

# Problem We Solve

Building or renovating a house is usually:

Time consuming

Costly

Unorganized

Risky due to unverified workers

Mistribazaar solves this by providing:

Verified professionals

Transparent bidding

AI-powered planning

Smart digital tools

# Technology Stack (Planned)

Frontend: React vite

Backend: Django

Database: PostreSql

AI & ML: Python, APIs

Maps & Location: Google Maps API

3D & Visualization: Three.js / Blender

# Vision

Our vision is to make Mistribazaar the “Amazon + UrbanClap for Construction” —
a one-stop digital solution for:

Materials

Workers

Contractors

House planning

Project management

# Who Can Use Mistribazaar

Homeowners

Builders

Contractors

Interior designers

Construction workers

Real estate developers

# Architecture


innerve-mistribazaar/
├── backend/                         # Django REST API
│   ├── config/                      # Django settings
│   ├── users/                       # User management & auth
│   ├── jobs/                        # Job postings
│   ├── bids/                        # Bidding system
│   ├── ratings/                     # Review system
│   └── ai_engine/image_generation   # AI features
│
└── frontend/                        # React.js web app
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── store/
    │   └── utils/
    └── public/
