const typeDefs = `
    type Query {
        me: User
        totalPhotos: Int!
        allPhotos: [Photo!]!
        allUsers: [User!]!
        totalUsers: Int!
    }
    type Mutation {
        postPhoto(input: PostPhotoInput!): Photo!
        githubAuth(code: String!): AuthPayload!
    }
    enum PhotoCategory {
        SEFLIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }
    type User {
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo]!
        inPhotos: [Photo!]!
    }
    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User!
        taggedUsers: [User!]!
    }
    type AuthPayload {
        token: String!
        user: User!
    }
    input PostPhotoInput {
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }
`;

module.exports = typeDefs;