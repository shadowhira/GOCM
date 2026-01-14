using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using OnlineClassroomManagement.Helper.Exceptions;

namespace Common.Exceptions
{
    public class ApiExceptionFilterAttribute : ExceptionFilterAttribute
    {
        private readonly IDictionary<Type, Action<ExceptionContext>> _exceptionHandlers;

        public ApiExceptionFilterAttribute()
        {
            // Register known exception types and handlers.
            _exceptionHandlers = new Dictionary<Type, Action<ExceptionContext>>
     {
         { typeof(ValidationException), HandleValidationException },
         { typeof(ValidationDetailException), HandleValidationDetailException },
         { typeof(NotFoundException), HandleNotFoundException },
         { typeof(DuplicateException), HandleDuplicateException },
         { typeof(UnauthorizedAccessException), HandleUnauthorizedAccessException },
         { typeof(ForbiddenAccessException), HandleForbiddenAccessException },
         { typeof(CustomException), HandleCustomException },
     };
        }

        public override void OnException(ExceptionContext context)
        {
            HandleException(context);

            base.OnException(context);
        }

        private void HandleException(ExceptionContext context)
        {
            Type type = context.Exception.GetType();
            if (_exceptionHandlers.TryGetValue(type, out Action<ExceptionContext>? handler))
            {
                handler.Invoke(context);
                return;
            }

            if (!context.ModelState.IsValid)
            {
                HandleInvalidModelStateException(context);
            }
        }

        private void HandleValidationException(ExceptionContext context)
        {
            if (context.Exception is ValidationException exception)
            {
                context.Result = new BadRequestObjectResult(new CustomExceptionResponse(ExceptionCode.Invalidate,
                    exception.Errors.Select(e => e.Value).SelectMany(x => x)));
            }
            else
            {
                context.Result = new BadRequestObjectResult(new CustomExceptionResponse(ExceptionCode.Invalidate));
            }

            context.ExceptionHandled = true;
        }

        private void HandleValidationDetailException(ExceptionContext context)
        {
            if (context.Exception is ValidationDetailException exception)
            {
                context.Result = new BadRequestObjectResult(new CustomExceptionDetailResponse(ExceptionCode.Invalidate,
                    exception.Errors));
            }
            else
            {
                context.Result = new BadRequestObjectResult(new CustomExceptionDetailResponse(ExceptionCode.Invalidate));
            }

            context.ExceptionHandled = true;
        }


        private void HandleInvalidModelStateException(ExceptionContext context)
        {
            var details = new ValidationProblemDetails(context.ModelState);

            context.Result = new BadRequestObjectResult(new CustomExceptionResponse(ExceptionCode.Invalidate,
                details.Errors.Select(e => e.Value).SelectMany(x => x)));

            context.ExceptionHandled = true;
        }

        private void HandleNotFoundException(ExceptionContext context)
        {
            if (context.Exception is NotFoundException notFoundException)
            {
                context.Result = new BadRequestObjectResult(new CustomExceptionResponse(ExceptionCode.NotFound,
                    new[] { notFoundException.Message }, notFoundException.ErrorDetails));
            }
            else
            {
                context.Result = new BadRequestObjectResult(new CustomExceptionResponse(ExceptionCode.NotFound));
            }

            context.ExceptionHandled = true;
        }

        private void HandleCustomException(ExceptionContext context)
        {
            if (context.Exception is CustomException exception)
            {
                context.Result = new BadRequestObjectResult(new CustomExceptionResponse(exception.Code, exception.Errors,
                    exception.ErrorDetails));
            }
            else
            {
                context.Result = new BadRequestObjectResult(new CustomExceptionResponse(ExceptionCode.UnKnow));
            }

            context.ExceptionHandled = true;
        }

        private void HandleDuplicateException(ExceptionContext context)
        {
            if (context.Exception is DuplicateException exception)
            {
                IEnumerable<string>? errors = new[] { exception.Message };
                context.Result = new BadRequestObjectResult(new CustomExceptionResponse(ExceptionCode.Duplicate, errors,
                    exception.ErrorDetails));
            }

            context.ExceptionHandled = true;
        }

        private void HandleUnauthorizedAccessException(ExceptionContext context)
        {
            context.Result = new ObjectResult(null)
            {
                StatusCode = StatusCodes.Status401Unauthorized
            };

            context.ExceptionHandled = true;
        }

        private void HandleForbiddenAccessException(ExceptionContext context)
        {
            context.Result = new ObjectResult(null)
            {
                StatusCode = StatusCodes.Status403Forbidden
            };

            context.ExceptionHandled = true;
        }
    }
}
