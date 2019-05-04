import React, { useState } from 'react';
import { useForm, FormHookOptions, FormHookDependencies } from '../src';
import {
  cleanup,
  render,
  fireEvent,
  act,
  waitForDomChange,
  Matcher,
} from 'react-testing-library';

interface FormValues {
  first: string;
  last: string;
  age: number;
  allowed: boolean;
}

const Form = (
  options: FormHookOptions<FormValues> & {
    dependencies?: FormHookDependencies<FormValues>;
  }
) => {
  const { dependencies = () => [], ...props } = options;
  const {
    handleBlur,
    handleChange,
    handleSubmit,
    values,
    touched,
    errors,
    submitCount,
  } = useForm<FormValues>(props, dependencies);

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="first"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.first}
        data-testid="first-input"
      />
      {touched.first && errors.first && (
        <div data-testid="first-errors">{errors.first}</div>
      )}
      <input
        name="last"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.last}
        data-testid="last-input"
      />
      {touched.last && errors.last && (
        <div data-testid="last-errors">{errors.last}</div>
      )}
      <input
        type="number"
        name="age"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.age}
        data-testid="age-input"
      />
      {touched.age && errors.age && (
        <div data-testid="age-errors">{errors.age}</div>
      )}
      <input
        name="allowed"
        type="checkbox"
        onChange={handleChange}
        onBlur={handleBlur}
        checked={values.allowed}
        data-testid="allowed-input"
      />
      {touched.allowed && errors.allowed && (
        <div data-testid="allowed-errors">{errors.allowed}</div>
      )}
      <input
        onChange={handleChange}
        onBlur={handleBlur}
        data-testid="missing-input"
      />
      <button type="submit" data-testid="submit">
        Submit
      </button>
      Attempts <div data-testid="submit-count">{submitCount}</div>
    </form>
  );
};

afterEach(cleanup);

describe('useForm()', () => {
  describe('initialValues', () => {
    it('should set the forms initial values when provided', () => {
      const { getByTestId } = render(
        <Form
          initialValues={{ first: 'John', last: 'Doe', age: 20, allowed: true }}
          onSubmit={() => {}}
          validate={() => ({})}
        />
      );
      const getInput = (id: string) => getByTestId(id) as HTMLInputElement;
      expect(getInput('first-input').value).toEqual('John');
      expect(getInput('last-input').value).toEqual('Doe');
      expect(getInput('age-input').value).toEqual('20');
      expect(getInput('allowed-input').value).toEqual('on');
    });
  });

  describe('validate()', () => {
    it('should set form errors on validation failure', async () => {
      const { getByTestId } = render(
        <Form
          initialValues={{ first: 'John', last: 'Doe', age: 20, allowed: true }}
          onSubmit={() => {}}
          validate={values => {
            if (values.first === 'John') {
              return {
                first: 'First name must not be John.',
              };
            }
            return {};
          }}
        />
      );

      await act(async () => {
        const submitButton = getByTestId('submit');
        fireEvent.click(submitButton);
      });

      const firstError = getByTestId('first-errors');
      expect(firstError.textContent).toEqual('First name must not be John.');
    });

    it('should prevent onSubmit from being called on validation failure', async () => {
      const onSubmit = jest.fn();

      const { getByTestId } = render(
        <Form
          initialValues={{ first: 'John', last: 'Doe', age: 20, allowed: true }}
          onSubmit={onSubmit}
          validate={values => {
            if (values.first === 'John') {
              return {
                first: 'First name must not be John.',
              };
            }
            return {};
          }}
        />
      );

      await act(async () => {
        const submitButton = getByTestId('submit');
        fireEvent.click(submitButton);
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should call onSubmit if validation passes', async () => {
      const onSubmit = jest.fn();

      const { getByTestId } = render(
        <Form
          initialValues={{ first: 'John', last: 'Doe', age: 20, allowed: true }}
          onSubmit={onSubmit}
          validate={() => ({})}
        />
      );

      await act(async () => {
        const submitButton = getByTestId('submit');
        fireEvent.click(submitButton);
      });

      expect(onSubmit).toHaveBeenCalledWith({
        age: 20,
        allowed: true,
        first: 'John',
        last: 'Doe',
      });
    });
  });

  describe('validateOnBlur', () => {
    describe('when enabled', () => {
      it('should re-validate when switching input forms', async () => {
        const { getByTestId, queryByTestId } = render(
          <Form
            initialValues={{
              first: 'John',
              last: 'Doe',
              age: 20,
              allowed: true,
            }}
            validateOnBlur={true}
            onSubmit={() => {}}
            validate={values => {
              if (values.first === 'John') {
                return {
                  first: 'First name must not be John.',
                };
              }
              return {};
            }}
          />
        );

        await act(async () => {
          const firstInput = getByTestId('first-input');
          const submitButton = getByTestId('submit');
          fireEvent.click(submitButton);
          fireEvent.change(firstInput, { target: { value: 'Joe' } });
          fireEvent.blur(firstInput);
        });

        expect(queryByTestId('first-errors')).toBeNull();
      });
    });

    describe('when disabled (default)', () => {
      it('should not re-validate on input blur', async () => {
        const { getByTestId, queryByTestId } = render(
          <Form
            initialValues={{
              first: 'John',
              last: 'Doe',
              age: 20,
              allowed: true,
            }}
            validateOnBlur={false}
            onSubmit={() => {}}
            validate={values => {
              if (values.first === 'John') {
                return {
                  first: 'First name must not be John.',
                };
              }
              return {};
            }}
          />
        );

        await act(async () => {
          const firstInput = getByTestId('first-input');
          const submitButton = getByTestId('submit');
          fireEvent.click(submitButton);
          fireEvent.change(firstInput, { target: { value: 'Joe' } });
          fireEvent.blur(firstInput);
        });

        expect(queryByTestId('first-errors')).not.toBeNull();
      });
    });
  });

  describe('validateOnChange', () => {
    describe('when enabled', () => {
      it('should revalidate on input change', async () => {
        const { getByTestId, queryByTestId } = render(
          <Form
            initialValues={{
              first: 'Abe',
              last: 'Doe',
              age: 20,
              allowed: true,
            }}
            validateOnBlur={false}
            validateOnChange={true}
            onSubmit={() => {}}
            validate={values => {
              if (values.first === 'Abe') {
                return {
                  first: 'First name must not be Abe.',
                };
              }
              return {};
            }}
          />
        );

        await act(async () => {
          const firstInput = getByTestId('first-input');
          const submitButton = getByTestId('submit');
          fireEvent.click(submitButton);
          // Wait for elements to be marked as touched
          await waitForDomChange();
          fireEvent.change(firstInput, { target: { value: 'Joe' } });
        });

        expect(queryByTestId('first-errors')).toBeNull();
      });
    });

    describe('when disabled (default)', () => {
      it('should not re-validate on input change', async () => {
        const { getByTestId, queryByTestId } = render(
          <Form
            initialValues={{
              first: 'John',
              last: 'Doe',
              age: 20,
              allowed: true,
            }}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={() => {}}
            validate={values => {
              if (values.first === 'John') {
                return {
                  first: 'First name must not be John.',
                };
              }
              return {};
            }}
          />
        );

        await act(async () => {
          const firstInput = getByTestId('first-input');
          const submitButton = getByTestId('submit');
          fireEvent.click(submitButton);
          // Wait for elements to be marked as touched
          await waitForDomChange();
          fireEvent.change(firstInput, { target: { value: 'Joe' } });
        });

        expect(queryByTestId('first-errors')).not.toBeNull();
      });
    });
  });

  describe('submitCount', () => {
    it('should update the submit count for each submit attempt', async () => {
      const { getByTestId } = render(
        <Form
          initialValues={{
            first: 'John',
            last: 'Doe',
            age: 20,
            allowed: true,
          }}
          validateOnBlur={false}
          validateOnChange={false}
          onSubmit={() => {}}
          validate={() => ({})}
        />
      );

      await act(async () => {
        const submitButton = getByTestId('submit');
        fireEvent.click(submitButton);
        await waitForDomChange();
      });

      expect(getByTestId('submit-count').textContent).toEqual('1');
    });
  });

  describe('value detection', () => {
    let onSubmit = jest.fn();
    let getByTestId: (text: Matcher) => HTMLElement;

    beforeEach(() => {
      onSubmit.mockReset();
      const result = render(
        <Form
          initialValues={{
            first: 'John',
            last: 'Doe',
            age: 20,
            allowed: true,
          }}
          validateOnBlur={false}
          validateOnChange={false}
          onSubmit={onSubmit}
          validate={() => ({})}
        />
      );

      getByTestId = result.getByTestId;
    });

    it('should resolve number input types to numbers', async () => {
      await act(async () => {
        fireEvent.change(getByTestId('age-input'), { target: { value: 50 } });
        fireEvent.click(getByTestId('submit'));
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ age: 50 })
      );
    });

    it('should resolve empty number fields to an empty string', async () => {
      await act(async () => {
        fireEvent.change(getByTestId('age-input'), { target: { value: '' } });
        fireEvent.click(getByTestId('submit'));
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ age: '' })
      );
    });

    it('should resolve a checkbox to a boolean value', async () => {
      await act(async () => {
        fireEvent.change(getByTestId('allowed-input'), {
          target: { value: true },
        });
        fireEvent.click(getByTestId('submit'));
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ allowed: true })
      );
    });

    it('should resolve textboxes to their input value', async () => {
      await act(async () => {
        fireEvent.change(getByTestId('first-input'), {
          target: { value: 'Joe' },
        });
        fireEvent.click(getByTestId('submit'));
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ first: 'Joe' })
      );
    });
  });

  describe('warnings', () => {
    let mockWarn: any;
    let getByTestId: (text: Matcher) => HTMLElement;

    beforeEach(() => {
      mockWarn = jest
        .spyOn(global.console, 'warn')
        .mockImplementation(() => {});
      const result = render(
        <Form
          initialValues={{
            first: 'John',
            last: 'Doe',
            age: 20,
            allowed: true,
          }}
          validateOnBlur={false}
          validateOnChange={false}
          onSubmit={() => {}}
          validate={() => ({})}
        />
      );

      getByTestId = result.getByTestId;
    });

    afterEach(() => {
      mockWarn.mockReset();
    });
    it('should warn on an invalid change event', async () => {
      act(() => {
        fireEvent.change(getByTestId('missing-input'), {
          target: { value: 'No!' },
        });
      });

      expect(global.console.warn).toHaveBeenCalled();
    });

    it('should warn on an invalid blur event', async () => {
      act(() => {
        fireEvent.blur(getByTestId('missing-input'));
      });

      expect(global.console.warn).toHaveBeenCalled();
    });
  });

  describe('reinitialization', () => {
    const Initializer = (props: {
      dependencies?: FormHookDependencies<FormValues>;
    }) => {
      const [first, setFirst] = useState('John');

      function change() {
        setFirst('Wendy');
      }

      return (
        <div>
          <Form
            initialValues={{
              first,
              last: 'Doe',
              age: 20,
              allowed: true,
            }}
            onSubmit={() => {}}
            validate={() => ({})}
            dependencies={props.dependencies}
          />
          <button data-testid="change" onClick={change}>
            Change
          </button>
        </div>
      );
    };

    it('should not re-initialize the form if there are no dependency changes', async () => {
      const { getByTestId } = render(<Initializer />);

      await act(async () => {
        fireEvent.click(getByTestId('change'));
      });

      expect((getByTestId('first-input') as HTMLInputElement).value).toEqual(
        'John'
      );
    });

    it('should reinitialize the form on any dependency changes', async () => {
      const { getByTestId } = render(
        <Initializer dependencies={options => [options.initialValues]} />
      );

      await act(async () => {
        fireEvent.click(getByTestId('change'));
      });

      expect((getByTestId('first-input') as HTMLInputElement).value).toEqual(
        'Wendy'
      );
    });
  });
});
