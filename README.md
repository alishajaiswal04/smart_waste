# ♻️ Smart Waste Management System

An IoT-based Smart Waste Management System designed to improve waste collection by monitoring dustbin fill levels, identifying bins that require collection, and providing dedicated dashboards for government authorities and garbage-truck drivers.

## 🚀 Overview

Traditional waste collection often follows fixed schedules, which can result in unnecessary truck trips and overflowing bins.

Our system provides a smarter approach by monitoring bin status and prioritizing bins that are full or close to being full.

## ✨ Features

- 📡 Real-time monitoring of dustbin fill levels
- 🤖 DBSCAN clustering to identify filled and near-full dustbins
- 🚨 Alerts for bins that require collection
- 🏛️ Dashboard for government/municipal authorities
- 🚛 Dashboard for garbage-truck drivers
- 📊 Bin status and collection priority monitoring
- ♻️ Efficient and data-driven waste collection

## 🧠 Machine Learning

### DBSCAN Clustering

DBSCAN (Density-Based Spatial Clustering of Applications with Noise) is used to group and identify dustbins based on their fill-level/status data.

The system uses the clustering results to help identify:

- Filled dustbins
- Dustbins approaching full capacity
- Dustbins requiring collection

## 🏗️ System Architecture

```text
IoT Sensors / Dustbins
        ↓
   Sensor Data
        ↓
     Backend
        ↓
   DBSCAN Model
        ↓
 ┌───────────────┐
 │ Bin Status &  │
 │ Prioritization│
 └───────┬───────┘
         ↓
 ┌───────────────────────┐
 │      Dashboards       │
 ├───────────────────────┤
 │ Government Authorities│
 │ Garbage-Truck Drivers │
 └───────────────────────┘

Tech Stack
- Machine Learning: Python, DBSCAN, Scikit-learn
- IoT: ESP32, Sensors
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js
- Database: MongoDB
🎯 Use Cases
- Municipal corporations
- Smart cities
- Universities and campuses
- Commercial areas
🌍 Impact
The system aims to:
- Reduce unnecessary garbage-truck trips
- Improve collection efficiency
- Reduce fuel and operational costs
- Prevent overflowing dustbins
- Support cleaner and smarter cities
👥 Team
Team: Binary_Brains
- Alisha Jaiswal
- Gautam Kumar
- Jiya Singh
- Rahul Kumar
📌 Future Scope
- ML-based prediction of future bin fill levels
- Advanced route optimization for garbage trucks
- Historical waste-data analysis
- Expansion to large-scale smart-city infrastructure
