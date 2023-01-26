import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { AppRouterType } from './server';

// Create Proxy Client
const client = createTRPCProxyClient<AppRouterType>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: {
        authorization: '0',
      },
    }),
  ],
});

// Requests
const doRequests = async () => {
  await client.listUsers
    .query()
    .then((users) => {
      console.log('listUsers()');
      console.log(users);
    })
    .catch((error) => console.log(error.message));

  await client.getUserById
    .query({ id: 0 })
    .then((user) => {
      console.log(`getUserById()`);
      console.log(user);
    })
    .catch((error) => console.log(error.message));

  await client.createUser
    .mutate({ name: 'Bob' })
    .then((user) => {
      console.log('createUser()');
      console.log(user);
    })
    .catch((error) => console.log(error.message));
};

doRequests();
