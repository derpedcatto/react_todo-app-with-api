/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserWarning } from './UserWarning';
import { addTodo, deleteTodo, getTodos, updateTodo } from './api/todos';
import { Todo } from './types/Todo';
import { ErrorMessage } from './types/ErrorMessage';
import { FilterStatus } from './types/FilterStatus';
import { ErrorNotification } from './components/ErrorNotification';
import { Result } from './types/Results';
import { TodoHeader } from './components/TodoHeader';
import { TodoList } from './components/TodoList';
import { TodoFooter } from './components/TodoFooter';
import { USER_ID } from './utils/preferences';

const prepareTodos = (todos: Todo[], filterStatus: FilterStatus): Todo[] => {
  return todos.filter(todo => {
    switch (filterStatus) {
      case FilterStatus.Active:
        return !todo.completed;

      case FilterStatus.Completed:
        return todo.completed;

      case FilterStatus.All:
        return true;
    }
  });
};

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(
    FilterStatus.All,
  );
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // #region Memos
  const filteredTodos = useMemo(() => {
    return prepareTodos(todos, filterStatus);
  }, [todos, filterStatus]);

  const todosLeft = useMemo(() => {
    return todos.filter(todo => !todo.completed).length;
  }, [todos]);

  const areAllTodosCompleted = useMemo(() => {
    return todos.length > 0 && todos.every(todo => todo.completed);
  }, [todos]);

  const hasCompletedTodos = useMemo(() => {
    return todos.some(todo => todo.completed);
  }, [todos]);
  // #endregion

  // #region Handlers
  const handleLoadTodos = async () => {
    setErrorMessage(null);

    try {
      const apiTodos = await getTodos();

      setTodos(apiTodos);
    } catch (error) {
      setErrorMessage(ErrorMessage.UnableToLoadTodos);
    }
  };

  const handleNewTodoFormSubmit = useCallback(
    async (formResult: Result): Promise<boolean> => {
      setIsLoading(true);

      if (!formResult.isSuccess) {
        setErrorMessage(formResult.error);
        setIsLoading(false);

        return false;
      }

      setTempTodo({
        id: 0,
        title: formResult.value,
        userId: USER_ID,
        completed: false,
      });

      try {
        const apiResult = await addTodo({
          title: formResult.value,
          userId: USER_ID,
          completed: false,
        });

        setTodos(currentTodos => [...currentTodos, apiResult]);
        setTempTodo(null);

        return true;
      } catch (error) {
        setErrorMessage(ErrorMessage.CantAddTodo);
        setTempTodo(null);

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleTodoDelete = useCallback(
    async (todoId: number): Promise<boolean> => {
      setIsLoading(true);

      try {
        await deleteTodo(todoId);

        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );

        return true;
      } catch (error) {
        setErrorMessage(ErrorMessage.CantDeleteTodo);

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleClearCompletedTodos = useCallback(async () => {
    setIsLoading(true);

    try {
      const deletionPromises = todos.map(async todo => {
        if (!todo.completed) {
          return todo;
        }

        try {
          await deleteTodo(todo.id);

          return null;
        } catch (error) {
          setErrorMessage(ErrorMessage.CantDeleteTodo);

          return todo;
        }
      });

      const results = await Promise.all(deletionPromises);

      setTodos(results.filter(todo => todo !== null));
    } catch (error) {
      setErrorMessage(ErrorMessage.CantDeleteTodo);
    } finally {
      setIsLoading(false);
    }
  }, [todos]);

  const handleTodoSetChecked = useCallback(
    async (todoId: number, isChecked: boolean) => {
      setIsLoading(true);

      try {
        const updatedTodo = await updateTodo({
          id: todoId,
          completed: isChecked,
        });

        setTodos(currentTodos =>
          currentTodos.map(todo => (todo.id === todoId ? updatedTodo : todo)),
        );
      } catch (error) {
        setErrorMessage(ErrorMessage.CantUpdateTodo);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleToggleAllTodos = useCallback(async () => {
    try {
      setIsLoading(true);

      let todosToUpdate: Todo[];
      let completedStateToSet: boolean;

      if (areAllTodosCompleted) {
        todosToUpdate = todos;
        completedStateToSet = false;
      } else {
        todosToUpdate = todos.filter(todo => !todo.completed);
        completedStateToSet = true;
      }

      const updatePromises = todosToUpdate.map(async todo => {
        try {
          return await updateTodo({
            id: todo.id,
            completed: completedStateToSet,
          });
        } catch (error) {
          setErrorMessage(ErrorMessage.CantUpdateTodo);

          return todo;
        }
      });

      const updatedTodos = await Promise.all(updatePromises);

      setTodos(currentTodos =>
        currentTodos.map(todo => {
          const updatedTodo = updatedTodos.find(
            innerUpdatedTodo => innerUpdatedTodo.id === todo.id,
          );

          return updatedTodo || todo;
        }),
      );
    } catch (error) {
      setErrorMessage(ErrorMessage.CantUpdateTodo);
    } finally {
      setIsLoading(false);
    }
  }, [todos, areAllTodosCompleted]);

  const handleTodoTitleChange = useCallback(
    async (todoId: number, newTitle: string) => {
      if (newTitle === '') {
        return handleTodoDelete(todoId);
      }

      setIsLoading(true);

      try {
        const updatedTodo = await updateTodo({ id: todoId, title: newTitle });

        setTodos(currentTodos =>
          currentTodos.map(todo => (todo.id === todoId ? updatedTodo : todo)),
        );

        return true;
      } catch (error) {
        setErrorMessage(ErrorMessage.CantUpdateTodo);

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [handleTodoDelete],
  );
  // #endregion

  useEffect(() => {
    handleLoadTodos();
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoHeader
          isLoading={isLoading}
          areAllTodosCompleted={areAllTodosCompleted}
          totalTodosCount={todos.length}
          onNewTodoFormSubmit={handleNewTodoFormSubmit}
          onToggleAllTodos={handleToggleAllTodos}
        />

        {!!todos.length && (
          <>
            <TodoList
              todos={filteredTodos}
              tempTodo={tempTodo}
              onTodoDelete={handleTodoDelete}
              onTodoSetChecked={handleTodoSetChecked}
              onTodoTitleChange={handleTodoTitleChange}
            />

            <TodoFooter
              todosLeft={todosLeft}
              hasCompletedTodos={hasCompletedTodos}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              onClearCompletedTodos={handleClearCompletedTodos}
            />
          </>
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        onHideError={() => setErrorMessage(null)}
      />
    </div>
  );
};
