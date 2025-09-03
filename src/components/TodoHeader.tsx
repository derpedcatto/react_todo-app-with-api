import React from 'react';
import classNames from 'classnames';
import { NewTodoForm } from './NewTodoForm';
import { Result } from '../types/Results';

type Props = {
  isLoading: boolean;
  areAllTodosCompleted: boolean;
  totalTodosCount: number;
  onNewTodoFormSubmit: (result: Result) => Promise<boolean>;
  onToggleAllTodos: () => Promise<void>;
};

export const TodoHeader = React.memo<Props>(
  ({
    isLoading,
    areAllTodosCompleted,
    onNewTodoFormSubmit,
    onToggleAllTodos,
    totalTodosCount,
  }) => {
    const shouldShowToggleButton = totalTodosCount > 0;

    return (
      <header className="todoapp__header">
        {shouldShowToggleButton && (
          <button
            type="button"
            className={classNames('todoapp__toggle-all', {
              active: areAllTodosCompleted,
            })}
            data-cy="ToggleAllButton"
            onClick={onToggleAllTodos}
          />
        )}

        <NewTodoForm isLoading={isLoading} onFormSubmit={onNewTodoFormSubmit} />
      </header>
    );
  },
);

TodoHeader.displayName = 'TodoHeader';
