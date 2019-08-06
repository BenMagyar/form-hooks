# form-hooks

Easily create forms in React components -- with hooks! Essentially
a dumbed down version of [Formik][] using hooks.

## Getting Started

```bash
npm install form-hooks
```

```js
import { useForm } from 'form-hooks';

const Sample = () => (
    const {
        errors,
        touched,
        values,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
    } = useForm({
        initialValues: {
            name: '',
            email: '',
        },
        onSubmit: values => fetch(/* with values */),
        validate: values => ({
            ...(!values.name.length ? { name: 'Requires a name' } : {}),
            ...(!values.email.length ? { email: 'Requires an email' } : {})
        }),
    }, options => [options.initialValues]);

    return (
        <form onSubmit={handleSubmit}>
            <input name="name"
                   type="text"
                   value={values.name}
                   onChange={handleChange}
                   onBlur={handleBlur}
            />
            {touched['name'] && errors['name']}
            <input name="email"
                   type="text"
                   value={values.email}
                   onChange={handleChange}
                   onBlur={handleBlur}
            />
            {touched['email'] && errors['email']}
            <button type="submit" disabled={isSubmitting}>submit</button>
        </form>
    )
)
```

## Documentation

### `useForm<Values>(options: FormHookOptions, dependencies?: FormHookDependencies<Values>): FormHookState<Values>` - `FormHookOptions`

The `useForm` hook takes some options (as an object) to initialize state
and manage form validation/submissions.

#### `initialValues: Values`

An object with the forms initial values. These values should not be required.

#### `onSubmit: (values: Values) => void`

Called when a form is submitted with the values set. Only called if validation
passes.

#### `validate: (values: Values) => FormHookErrors<Values> | Promise<FormHookErrors<Values>>`

Called when a form is submitted prior to the `onSubmit` call. Returns an object
of errors similar to `Formik`.

#### `validateOnBlur: boolean` - _true_

Indicates if `useForm` should re-validate the input on blur.
Only fired when all fields have been touched that were in the `initialValues`
object.

#### `validateOnChange: boolean` - _true_

Indicates if `useForm` should re-validate the input on change.
Only fired when all fields have been touched that were in the `initialValues`
object.

### `useForm<Values>(options: FormHookOptions, dependencies?: FormHookDependencies<Values>): FormHookState<Values>` - `FormHookState`

#### `errors: FormHookErrors<Values>`

An object that contains the form errors where the key is the field name
and the value is the error message.

#### `touched: FormHookTouched<Values>`

An object that contains which form fields have been touched. The key is
the field name, the value is a boolean of if the field has been touched.

#### `values: FormHookValues`

An object that contains all of the values of the form. Initialized with the
`initialValues` originally passed in. Modified by the `handleChange` handler.

#### `handleBlur: (event: React.ChangeEvent<any>) => void`

Marks a field as `touched` to show errors after all fields are touched.

#### `handleChange: (event: React.ChangeEvent<any>) => void`

Changes the fields value in the `values` state.

#### `handleSubmit: (event: React.ChangeEvent<HTMLFormElement>) => Promise<void>`

Handles calling validation prior to the `onSubmit` handler and setting the
`touched`, `errors` and `isSubmitting` state internally.

#### `isSubmitting: boolean`

Boolean value if the form is currently submitting.

#### `submitCount: number`

Number of times the form was submitted.

#### `setErrors: (errors: FormHookErrors<Values>) => void`

Function that allows for errors to be set outside of the `useForm`
internal handlers (good for handling request errors).

#### `resetForm: () => void`

Resets a form to its initial state.

#### `resetValue: (value: keyof Values, shouldResetTouched?: boolean = false)`

Resets a field value to its initial value and resets its errors state. Can
optionally reset its touched state.

### `FormHookDependencies<Values>` - Form Reinitialization

The second parameter to `useForm` allows for a list of dependencies to be
declared from the collection of options passed through in the first argument.
A change in a dependency will reset the form. For instance in this example:

```ts
useForm(
  {
    initialValues: { first: 'John', last: 'Doe' },
    onSubmit: () => {},
    validate: () => ({}),
  },
  options => [options.initialValues]
);
```

Changing the `initialValues` object will cause the Form to be re-initialized. `initialValues`, `errors`, `touched`, `submitCount` and `isSubmitting` will be reset.

[formik]: https://github.com/jaredpalmer/formik
