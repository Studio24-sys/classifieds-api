# Quist API

This is the backend for the Quist app, a simple yet robust classified marketplace. It is a RESTful API built with Node.js and Express, Prisma and MySQL. It is designed to be easy to use and easy to extend.

## Goal
The goal of this project is to provide a simple, yet robust, RESTful API for a classified marketplace, by carefully selecting and implementing features that match the needs and behaviors of the target audience, and can significantly enhance the user experience and success of the classified marketplace app. Remember, the key is to start with a solid foundation of essential features and then iteratively add and refine features based on user feedback and market demand. 


### Essential Features for a Classified Marketplace

1. **User Verification**: Implement robust user verification processes (e.g., phone number, email, and ID verification) to increase trust and safety within the platform.

2. **Geolocation Features**: Allow users to search for items or services near their location, and enable sellers to tag their listings with a location to facilitate local transactions.

3. **Messaging System**: A secure in-app messaging system enables buyers and sellers to communicate without sharing personal contact details, enhancing privacy and security.

4. **Category-Specific Filters**: Provide detailed filters tailored to the categories on your platform (e.g., automotive, real estate, services) to help users find listings more efficiently.

5. **Ratings and Reviews for Users**: Not just for products, but allowing users to rate and review each other can help build a trustworthy community and encourage positive interactions.

6. **Social Media Integration**: Enable users to share listings on social media platforms to increase visibility and attract more users to the platform.

7. **Reporting and Moderation Tools**: Allow users to report suspicious or inappropriate listings, and have a system in place for moderators to review and take necessary actions to maintain platform integrity.

### Additional Features to Consider

1. **Community Forums**: Create a space for users to discuss various topics, ask questions, and share advice related to the categories on your marketplace. This can foster a sense of community and engagement.

2. **Event Listings and Community Activities**: Depending on your target audience, incorporating local event listings or community activities can add value and increase user engagement.

3. **Safety Tips and Guidelines**: Provide users with safety tips for conducting transactions, meeting buyers/sellers, and avoiding scams. This is particularly important for classified marketplaces.

4. **Featured Listings and Promotions**: Offer sellers the option to promote their listings to gain more visibility. This can also serve as a revenue stream for the platform.

5. **Responsive Customer Support**: Ensure that users have access to prompt and helpful customer support for any issues that arise during their use of the platform.

6. **Simplified Listing Process**: Make it as easy as possible for users to post listings, with options to add multiple photos, detailed descriptions, and specific attributes relevant to different categories.

7. **Push Notifications**: Notify users about relevant listings based on their search history, messages from other users, or updates to their own listings.

## Setting Up

1. **Clone the repo**: In your cmd, run 

```shell
git clone https://github.com/samueloshio/quist-api.git
```
2. **Change Directory**:

```shell
cd quist-api
```

3. **Install Dependencies**:
For this project, we are using yarn as our package manager. To install the dependencies, run the following command in your cmd:

```shell
yarn install
```
4. **Run Quist API**:
To run the Quist API, run the following command in your cmd:

```shell
yarn dev
```

## Project Break Down

**Breaking down the development of the classified marketplace RESTful API into stages can help manage complexity and ensure a systematic approach to building out features.**

The project is broken down into the following stages:

### Stage 1: Project Setup and Basic Configuration
In this stage, we will set up the project, install dependencies, and configure the basic settings for the RESTful API, such as setting up the framework, server, and environment variables.

### Stage 2: Database and ORM Integration
In this stage, we will set up the database and integrate an ORM (Object-Relational Mapping) tool to interact with the database and define the data models for the classified marketplace app.

### Stage 3: Core Features Development
In this stage, we will develop the core features of the classified marketplace app, such as user authentication, listing management, search and filter, and user profiles.

### Stage 4: Advanced Features and Integrations
In this stage, we will implement advanced features and integrations, such as messaging system, geolocation features, category-specific filters, ratings and reviews, and social media integration.


### Stage 5: Security, Performance, and Testing
In this stage, we will focus on security, performance, and testing of the RESTful API, ensuring that the platform is secure, scalable, and reliable for users.


### Stage 6: Deployment and Monitoring
In this stage, we will deploy the RESTful API to a production environment and set up monitoring tools to ensure that the platform is running smoothly and efficiently.

## Status
The project is currently in the first stage, which is the project setup and basic configuration.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

Happy coding!😊

