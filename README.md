# MXM Frontend

**WIP**

NOTE:

This repo was created from an initial prototype that
used a preliminary version of the MXM GraphQL API,
and with Vue2/Quasar1 as web framework.

The new version in this repo:

- Uses a new, simplified GraphQL API being developed in a separate repo.
- Still uses Vue2/Quasar1, but the plan is to migrate to Vue3/Quasar2
  when various MXM API adjustments get more stable.

## Development

Dependencies:

    yarn global add @quasar/cli
    yarn

Have an MXM GraphQL endpoint running somewhere.

If not already

      cp config.json.template src/statics/config/config.json

Adjust `graphqlUri` in `src/statics/config/config.json` as appropriate.

Then:

      quasar dev --modern

which will open <http://localhost:8080/>

### Build

      quasar build --modern

Note that a build is typically intended for a docker release, so in this case the
particular file `src/statics/config/config.json` is NOT used.
Instead, the location of the `config.json` file (which is still required)
is indicated as a setting prior to running the container.

TODO point to docker setup space.
