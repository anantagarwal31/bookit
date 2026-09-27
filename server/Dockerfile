# ---- stage 1: compile TypeScript to JavaScript ----
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install                # dev dependencies are needed for tsc

COPY . .
RUN npm run build              # src/**/*.ts -> dist/**/*.js

# ---- stage 2: run only the compiled output ----
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev     # no TypeScript in the final image

COPY --from=build /app/dist ./dist

EXPOSE 4000
CMD ["npm", "start"]