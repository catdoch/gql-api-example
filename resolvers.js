const { authorizeWithGithub } = require('./lib');

let _id = 0;

var users = [
    { githubLogin: 'mHattrup', name: 'Mike Hattrup' },
    { githubLogin: 'gPlake', name: 'Glen Plake' },
    { githubLogin: 'sSchmidt', name: 'Scot Schmidt' }
];

var tags = [
    { photoID: '1', userID: 'gPlake' },
    { photoID: '2', userID: 'sSchmidt' },
    { photoID: '2', userID: 'mHattrup' },
    { photoID: '2', userID: 'gPlake' }
];

var photos = [
    {
        id: '1',
        name: 'Dropping the Heart Chute',
        description: 'The heart chute is one of my favorite chutes',
        category: 'ACTION',
        githubUser: 'gPlake'
    },
    {
        id: '2',
        name: 'Enjoying the sunshine',
        category: 'SELFIE',
        githubUser: 'sSchmidt'
    },
    {
        id: '3',
        name: 'Gunbarrel 25',
        description: '25 laps on gunbarrel today',
        category: 'LANDSCAPE',
        githubUser: 'sSchmidt'
    }
];

const resolvers = {
    Query: {
        me: (parent, args, { currentUser }) => currentUser,
        totalPhotos: (parent, args, { db }) => 
            db.collection('photos')
            .estimatedDocumentCount,
        allPhotos: (parent, args, { db }) =>
            db.collection('photos')
            .find()
            .toArray(),
        totalUsers: (parent, args, { db }) =>
            db.collection('users')
            .estimatedDocumentCount(),
        allUsers: (parent, args, { db }) =>
            db.collection('users')
                .find()
                .toArray()
    },
    Mutation: {
        async postPhoto(parent, args, { db, currentUser }) {
            if (!currentUser) {
                throw new Error('only an authorized user can post a photo');
            }
            const newPhoto = {
                ...args.input,
                userID: currentUser.githubLogin,
                created: new Date()
            };
            const { insertedIds } = await db.collection('photos').insert(newPhoto);
            newPhoto.id = insertedIds[0];

            return newPhoto;
        },
        async githubAuth(parent, { code }, { db }) {
            let {
                message,
                access_token,
                avatar_url,
                login,
                name
            } = await authorizeWithGithub({
                client_id: '8cd65d65296faa28ec36',
                client_secret: 'ed97765734b59664c6d109b3ea27043b0f2985dc',
                code
            })
            if (message) {
                throw new Error(message);
            }
            let latestUserInfo = {
                name,
                githubLogin: login,
                githubToken: access_token,
                avatar: avatar_url
            };
            const { ops:[user] } = await db
                .collection('users')
                .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });
            return { user, token: access_token };
        }
    },
    Photo: {
        id: parent => parent.id || parent._id,
        url: parent => `http://example.com/img/${parent.id}.jpg`,
        postedBy: (parent, args, { db }) => {
            db.collection('users').findOne({ githubLogin: parent.userID })
        },
        taggedUsers: parent => tags
                .filter(tag => tag.photoID === parent.id)
                .map(tag => tag.userID)
                .map(userID => users.find(u => u.githubLogin === userID))
    },
    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin);
        },
        inPhotos: parent => tags
            .filter(tag => tag.userID === parent.id)
            .map(tag => tag.photoID)
            .map(photoID => photos.find(p => p.id === photoID))
    }
};

module.exports = resolvers;