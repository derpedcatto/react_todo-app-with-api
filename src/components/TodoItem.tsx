import { memo, useEffect, useRef, useState } from 'react';
import { Todo } from '../types/Todo';
import classNames from 'classnames';

type Props = {
  todo: Todo;
  onTodoDelete: (todoId: number) => Promise<boolean>;
  onTodoSetChecked: (todoId: number, isChecked: boolean) => Promise<void>;
  onTodoTitleChange: (todoId: number, newTitle: string) => Promise<boolean>;
};

export const TodoItem = memo<Props>(
  ({ todo, onTodoDelete, onTodoSetChecked, onTodoTitleChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(todo.title);

    const inputRef = useRef<HTMLInputElement>(null);
    const isSubmittingRef = useRef(false);

    // #region Handlers
    const handleOnDelete = async () => {
      setIsLoading(true);

      try {
        const isSuccess = await onTodoDelete(todo.id);

        if (!isSuccess) {
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };

    const handleOnSetCompleted = async () => {
      setIsLoading(true);

      await onTodoSetChecked(todo.id, !todo.completed);

      setIsLoading(false);
    };

    const handleTodoTitleChange = async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      if (!inputRef.current || isSubmittingRef.current) {
        return;
      }

      isSubmittingRef.current = true;

      const formattedTitle = inputRef.current?.value.trim();

      if (formattedTitle === todo.title) {
        setIsEditing(false);

        isSubmittingRef.current = false;

        return;
      }

      setIsLoading(true);

      try {
        const isSuccess = await onTodoTitleChange(todo.id, formattedTitle);

        if (isSuccess) {
          setTitle(formattedTitle);
          setIsEditing(false);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
        isSubmittingRef.current = false;
      }
    };

    const handleBlur = () => {
      if (isSubmittingRef.current) {
        return;
      }

      handleTodoTitleChange();
    };

    const handleDoubleClick = () => {
      setIsEditing(!isEditing);
    };
    // #endregion

    // #region Effects
    useEffect(() => {
      setTitle(todo.title);
    }, [todo.title]);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEditing]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsEditing(false);
          setTitle(todo.title);
          setIsLoading(false);
          isSubmittingRef.current = false;
        }
      };

      if (isEditing) {
        document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isEditing, todo.title]);
    // #endregion

    return (
      <div
        data-cy="Todo"
        className={classNames('todo', { completed: todo.completed })}
      >
        {/*eslint-disable-next-line jsx-a11y/label-has-associated-control*/}
        <label className="todo__status-label" htmlFor={todo.id.toString()}>
          <input
            id={todo.id.toString()}
            data-cy="TodoStatus"
            type="checkbox"
            className="todo__status"
            checked={todo.completed}
            onChange={handleOnSetCompleted}
          />
        </label>

        {isEditing ? (
          <form onSubmit={handleTodoTitleChange}>
            <input
              ref={inputRef}
              data-cy="TodoTitleField"
              type="text"
              className="todo__title-field"
              placeholder="Empty todo will be deleted"
              value={title}
              onBlur={handleBlur}
              onChange={event => setTitle(event.target.value)}
            />
          </form>
        ) : (
          <>
            <span
              data-cy="TodoTitle"
              className="todo__title"
              onDoubleClick={handleDoubleClick}
            >
              {title}
            </span>

            <button
              type="button"
              className="todo__remove"
              data-cy="TodoDelete"
              onClick={handleOnDelete}
            >
              ×
            </button>
          </>
        )}

        <div
          data-cy="TodoLoader"
          className={classNames('modal overlay', {
            'is-active': todo.id === 0 || isLoading,
          })}
        >
          <div className="modal-background has-background-white-ter" />
          <div className="loader" />
        </div>
      </div>
    );
  },
);

TodoItem.displayName = 'TodoItem';
