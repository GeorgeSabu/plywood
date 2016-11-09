/*
 * Copyright 2016-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { r, ExpressionJS, ExpressionValue, Expression, ChainableUnaryExpression } from './baseExpression';
import { SQLDialect } from '../dialect/baseDialect';
import { PlywoodValue } from '../datatypes/index';

export class ConcatExpression extends ChainableUnaryExpression {
  static op = "Concat";
  static fromJS(parameters: ExpressionJS): ConcatExpression {
    return new ConcatExpression(ChainableUnaryExpression.jsToValue(parameters));
  }

  constructor(parameters: ExpressionValue) {
    super(parameters, dummyObject);
    this._ensureOp("concat");
    this._checkOperandTypes('STRING', 'SET/STRING');
    this._checkExpressionTypes('STRING');
    this.type = this.operand.type;
  }

  protected _calcChainableUnaryHelper(operandValue: any, expressionValue: any): PlywoodValue {
    if (operandValue === null || expressionValue === null) return null;
    return '' + operandValue + expressionValue;
  }

  protected _getJSChainableUnaryHelper(operandJS: string, expressionJS: string): string {
    return Expression.jsNullSafetyBinary(operandJS, expressionJS, ((a, b) => `${a}+${b}`), operandJS[0] === '"', expressionJS[0] === '"');
  }

  protected _getSQLChainableUnaryHelper(dialect: SQLDialect, operandSQL: string, expressionSQL: string): string {
    return dialect.concatExpression(operandSQL, expressionSQL);
  }

  public isAssociative(): boolean {
    return true;
  }

  protected specialSimplify(): Expression {
    const { operand, expression } = this;

    // ''.concat(X)
    if (operand.equals(Expression.EMPTY_STRING)) return expression;

    // X.concat('')
    if (expression.equals(Expression.EMPTY_STRING)) return operand;

    return this;
  }
}

Expression.register(ConcatExpression);