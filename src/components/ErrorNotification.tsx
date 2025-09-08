import classNames from 'classnames';
import { ErrorMessage } from '../types/ErrorMessage';
import React, { useEffect } from 'react';

type Props = {
  errorMessage: ErrorMessage | null;
  onHideError: () => void;
};

export const ErrorNotification: React.FC<Props> = ({
  errorMessage,
  onHideError,
}) => {
  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = setTimeout(() => {
      onHideError();
    }, 3000);

    return () => clearTimeout(timer);
  }, [errorMessage, onHideError]);

  return (
    <div
      data-cy="ErrorNotification"
      className={classNames(
        'notification is-danger is-light has-text-weight-normal',
        { hidden: errorMessage === null },
      )}
    >
      <button
        data-cy="HideErrorButton"
        type="button"
        className="delete"
        onClick={onHideError}
      />

      {errorMessage}
    </div>
  );
};
