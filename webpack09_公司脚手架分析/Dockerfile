FROM harbor.cyber-insight.com/base/nginx:1.14.1

ADD  dist /usr/share/nginx/html$publicPath
COPY mysite.template /etc/nginx/conf.d/
CMD sed -i "s|.*var externalEnvironment.*|var externalEnvironment = \'$external_environment\'|" /usr/share/nginx/html$publicPath"$version"/index.html \
&& envsubst '$version $placeholder' < /etc/nginx/conf.d/mysite.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
