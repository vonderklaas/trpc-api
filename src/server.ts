// tRPC imports
import * as trpcExpress from '@trpc/server/adapters/express';
import { inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

const PORT = 3000;
import express from 'express';

const app = express();

// Types
type UserType = {
  id: number;
  name: string;
};

export type AppRouterType = typeof appRouter;

// Data
const userList: UserType[] = [
  {
    id: 0,
    name: 'Nick',
  },
  {
    id: 1,
    name: 'Anastasia',
  },
];

// "Middleware" Auth Context
const createContext = (options: trpcExpress.CreateExpressContextOptions) => {
  const userId = options.req.headers.authorization;

  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No userId was provided!',
    });
  }

  const user = userList.find((user) => user.id === parseInt(userId));

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No matching user was found',
    });
  }

  return {
    ...options,
    user,
  };
};

// tRPC instance
const trpc = initTRPC
  .context<inferAsyncReturnType<typeof createContext>>()
  .create();

// Router
const appRouter = trpc.router({
  // Query
  listUsers: trpc.procedure.query(({ ctx }) => {
    console.log('Requesting user:', ctx.user.name);
    return userList;
  }),
  // Query
  getUserById: trpc.procedure
    .input(z.object({ id: z.number() }))
    .query((req) => {
      const { input } = req;
      return userList.find((user) => user.id === input.id);
    }),
  // Mutation
  createUser: trpc.procedure
    .input(z.object({ name: z.string() }))
    .mutation((req) => {
      const { input } = req;
      // Construct user
      const newUser: UserType = {
        name: input.name,
        id: userList[userList.length - 1].id + 1,
      };
      userList.push(newUser);
      return newUser;
    }),
});

// Inject tRPC into Express
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter as AppRouterType,
    createContext,
  })
);

app.listen(PORT, () => {
  console.log(`App is running on PORT: ${PORT}`);
});
