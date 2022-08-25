# Some development notes

#### Along with `qgeomap`

NOTE: Later on, I decided to copy the `qgeomap` extension code here directly for convenience.
What follows were instructions relevant when using `qgeomap` as an extension.

The qgeomap extension dependency was added via the usual mechanism `quasar ext add @mbari/qgeomap`.
(The actual dependency is `@mbari/quasar-app-extension-qgeomap`).

If also doing adjustments in the extension, do the following to "link"
with the local source code of the extension, instead of the published package:

    yarn unlink @mbari/quasar-app-extension-qgeomap
    yarn add --dev link:../../qgeomap

which of course assumes the indicated path is qgeomap's root directory.

#### history mode

With history mode (`vueRouterMode: 'history'`), all seems to work _except_ that individual
mission template files are not found.
Example <http://localhost:8080/TD_18080/mt/%2F_examples%2FSysLogExample.tl>.
Adding a trailing slash makes it work:
<http://localhost:8080/TD_18080/mt/%2F_examples%2FSysLogExample.tl/>.
So, I suspect this is due to the following:
- the `.tl` "file extension" (actually, also any other file extension that may get associated
  with a some non-html content-type) makes the browser set an Accept header that does not
  include html (or that includes it but with less preference).
- then, both `quasar dev` and `quasar serve --history ...` respond with not-found
  due to such Accept header.
So, this seems like a quasar bug because their `--history` option description says
"Use history api fallback; **All** requests fallback to /index.html".
I'm not finding any concrete known issues, but this seems somwhat related:
<https://github.com/quasarframework/quasar/issues/8513>.

---
> BTW, with default options, curlie differs wrt to httpie or curl, for example:
> ```
> curlie get http://localhost:4000/TD_18080/mt/%2F_examples%2FSysLogExample.tl/
> ```
> responds with not-found, but both of these work:
> ```
> http        http://localhost:4000/TD_18080/mt/%2F_examples%2FSysLogExample.tl/
> curl -X GET http://localhost:4000/TD_18080/mt/%2F_examples%2FSysLogExample.tl/
> ```
> As indicated with the `--curl` option:
> ```
> $ curlie --curl get http://localhost:4000/TD_18080/mt/%2F_examples%2FSysLogExample.tl/
> curl -X GET http://localhost:4000/TD_18080/mt/%2F_examples%2FSysLogExample.tl/ -s -S -v -H "Accept: application/json, */*"
> ```
> the issue is that 'application/json' is given preference in Accept header.
