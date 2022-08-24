# Mission Execution Mediation Service

**WIP**

The Mission Execution Mediation Service (MXM) effort seeks to provide a set of
programmatic and user interfaces to integrate mission information across
diverse mission execution systems at MBARI, as well as to support the integration
of third-party applications, in particular to facilitate extended planning
capabilities on MBARI assets

The proposed MXM interfaces will support a unified view of the information in terms
of available mission definitions, parameterization, scheduling, and execution status.

## The MXM ecosystem

The MXM ecosystem consists of the following components:

- MXM Server: the central MXM service where mission execution systems (_providers_)
  can be registered to expose all relevant mission information and capabilities for
  mission scheduling.
- MXM Webapp: The GUI for the MXM service.
- Providers: The external mission execution systems integrated into the MXM ecosystem.
  Each provider implements an MXM Provider API (in full or in part, depending on capabilities)
  to support this integration.

## MXM Webapp

This is the web based GUI for the MXM service.
The current focus of this GUI is on facilitating the development of the overall system,
so the exposed UI organization and functionality may not be very user-friendly yet.

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
